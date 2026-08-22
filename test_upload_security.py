import requests
import io
import sqlite3
import sys
sys.path.append("backend")

BASE_URL = "http://127.0.0.1:8000"

def test_upload_security():
    print("🔒 TESTANDO HARDENING DE UPLOAD DE ARQUIVOS...")

    # 1. Login com usuário admin/dona
    # Obtém a senha/email da dona ou desenvolvedor
    conn = sqlite3.connect("backend/palieduca.db")
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE cargo IN ('dona', 'desenvolvedor') LIMIT 1")
    row = cursor.fetchone()
    admin_email = row[0] if row else "pedro@palieduca.com"
    conn.close()

    # Login
    login_res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": admin_email,
        "password": "123" # Senha default do seed se houver, ou token de teste
    })

    if login_res.status_code != 200:
        # Tenta senha padrao de admin
        login_res = requests.post(f"{BASE_URL}/api/auth/login", data={
            "username": admin_email,
            "password": "admin"
        })

    token = login_res.json().get("access_token") if login_res.status_code == 200 else None
    if not token:
        # Se não logou, gera token JWT com auth.create_access_token
        import auth
        token = auth.create_access_token({"sub": admin_email, "role": "desenvolvedor"})

    headers = {"Authorization": f"Bearer {token}"}

    # Teste 1: Arquivo legítimo (PNG)
    print("\n1. Testando upload de imagem válida (.png)...")
    valid_file = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82")
    res1 = requests.post(
        f"{BASE_URL}/api/media/upload",
        headers=headers,
        files={"file": ("imagem_teste.png", valid_file, "image/png")}
    )
    assert res1.status_code == 200, f"Upload válido falhou: {res1.text}"
    print(f"   ✅ Upload válido aceito com sucesso: {res1.json().get('file_url')}")

    # Teste 2: Extensão perigosa (.exe / .sh / .php)
    print("\n2. Testando bloqueio de extensão proibida (.exe)...")
    fake_exe = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
    res2 = requests.post(
        f"{BASE_URL}/api/media/upload",
        headers=headers,
        files={"file": ("malware.exe", fake_exe, "application/octet-stream")}
    )
    assert res2.status_code == 400, f"Deveria ter bloqueado .exe, mas retornou {res2.status_code}: {res2.text}"
    print(f"   ✅ Extensão perigosa bloqueada com sucesso! (400: {res2.json().get('detail')})")

    # Teste 3: Tentativa de Path Traversal no nome do arquivo
    print("\n3. Testando sanitização contra Path Traversal (../../perigo.jpg)...")
    fake_jpg = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00")
    res3 = requests.post(
        f"{BASE_URL}/api/media/upload",
        headers=headers,
        files={"file": ("../../etc/passwd_foto.jpg", fake_jpg, "image/jpeg")}
    )
    assert res3.status_code == 200, f"Falha no upload sanitizado: {res3.text}"
    file_url = res3.json().get("file_url")
    assert ".." not in file_url and "/etc/" not in file_url, f"Path traversal não foi limpo: {file_url}"
    print(f"   ✅ Path traversal sanitizado com sucesso! URL gerada: {file_url}")

    print("\n==========================================")
    print("🛡️ TODOS OS TESTES DE HARDENING PASSARAM COM 100% DE SUCESSO!")
    print("==========================================")

if __name__ == "__main__":
    test_upload_security()
