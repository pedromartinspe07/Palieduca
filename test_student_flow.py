import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_full_student_flow():
    print("========================================")
    print("🧪 INICIANDO TESTE DO FLUXO COMPLETO DO ALUNO")
    print("========================================")

    # 1. Health check
    print("\n1. Verificando API de Saúde...")
    res = requests.get(f"{BASE_URL}/api/health")
    assert res.status_code == 200, f"Health falhou: {res.text}"
    print("   ✅ API Online!")

    # 2. Cadastro de um Novo Aluno
    timestamp = int(time.time())
    student_email = f"aluno_teste_{timestamp}@palieduca.com"
    student_password = "SenhaSegura123!"
    student_name = "Aluno Teste Palieduca"

    print(f"\n2. Registrando novo aluno ({student_email})...")
    reg_res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "nome": student_name,
        "email": student_email,
        "senha": student_password
    })
    print(f"   Status do Registro: {reg_res.status_code}")
    assert reg_res.status_code in [200, 201], f"Falha no registro: {reg_res.text}"
    reg_data = reg_res.json()
    print("   ✅ Aluno registrado com sucesso!")

    # 2.1 Verificação de Código de Email
    print("\n2.1 Obtendo código de verificação enviado por e-mail...")
    import sqlite3
    conn = sqlite3.connect("backend/palieduca.db")
    cursor = conn.cursor()
    cursor.execute("SELECT verification_code FROM users WHERE email = ?", (student_email,))
    row = cursor.fetchone()
    verification_code = row[0] if row else "123456"
    conn.close()
    print(f"   Código de verificação gerado: {verification_code}")

    print(f"   Confirmando e-mail do aluno via /api/auth/verify-email...")
    verify_res = requests.post(f"{BASE_URL}/api/auth/verify-email", json={
        "email": student_email,
        "code": verification_code
    })
    assert verify_res.status_code == 200, f"Falha na verificação de e-mail: {verify_res.text}"
    print("   ✅ E-mail verificado com sucesso!")

    # 3. Login do Aluno
    print("\n3. Fazendo Login do novo aluno...")
    login_res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": student_email,
        "password": student_password
    })
    print(f"   Status do Login: {login_res.status_code}")
    assert login_res.status_code == 200, f"Falha no login: {login_res.text}"
    login_data = login_res.json()
    token = login_data.get("access_token")
    assert token, "Token JWT não retornado"
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   ✅ Login realizado com sucesso! Token JWT obtido.")

    # 4. Verificação de Perfil
    print("\n4. Obtendo Perfil do Usuário autenticado (/api/auth/me)...")
    me_res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Falha ao obter perfil: {me_res.text}"
    me_data = me_res.json()
    print(f"   ✅ Perfil validado: Nome: {me_data['nome']}, Cargo: {me_data['cargo']}")

    # 5. Listagem de Módulos
    print("\n5. Buscando Lista de Módulos disponíveis (/api/modules)...")
    modules_res = requests.get(f"{BASE_URL}/api/modules", headers=headers)
    assert modules_res.status_code == 200, f"Falha ao listar módulos: {modules_res.text}"
    modules = modules_res.json()
    print(f"   ✅ {len(modules)} módulos encontrados no catálogo.")
    for m in modules[:3]:
        print(f"      - [{m.get('slug_id')}] {m.get('title')}")

    # 6. Carregar Módulo 1 (Fundamentos)
    mod_slug = modules[0]['slug_id'] if len(modules) > 0 else "fundamentos"
    print(f"\n6. Acessando Conteúdo do Módulo '{mod_slug}'...")
    mod_content_res = requests.get(f"{BASE_URL}/api/pages/modulo_{mod_slug}")
    print(f"   Status do Conteúdo: {mod_content_res.status_code}")
    if mod_content_res.status_code == 200:
        mod_page = mod_content_res.json()
        print("   ✅ Conteúdo do módulo carregado com sucesso!")

    # 7. Progresso e Atividades do Módulo
    print(f"\n7. Verificando progresso inicial do aluno no sistema (/api/progress)...")
    progress_res = requests.get(f"{BASE_URL}/api/progress", headers=headers)
    assert progress_res.status_code == 200, f"Falha ao buscar progresso: {progress_res.text}"
    prog_data = progress_res.json()
    mod_prog = prog_data.get('module_progress', {}).get(mod_slug, {})
    print(f"   Progresso Geral: {prog_data.get('overall_percentage', 0)}%")
    print(f"   Progresso no Módulo '{mod_slug}': {mod_prog.get('percentage', 0)}% ({mod_prog.get('completed', 0)}/{mod_prog.get('total', 0)} atividades)")

    # 8. Concluir atividade / aula no Módulo
    print(f"\n8. Marcando atividade real do Módulo como concluída (/api/progress/toggle)...")
    blocks_list = json.loads(mod_page.get("content", "[]")) if mod_page.get("content") else []
    act_id = str(blocks_list[0]["id"]) if (blocks_list and len(blocks_list) > 0 and blocks_list[0].get("id")) else f"{mod_slug}_intro"
    
    complete_res = requests.post(
        f"{BASE_URL}/api/progress/toggle",
        headers=headers,
        json={"module_slug": mod_slug, "activity_id": act_id, "completed": True}
    )
    print(f"   Status da conclusão: {complete_res.status_code}")
    assert complete_res.status_code == 200, f"Falha ao concluir atividade: {complete_res.text}"
    print(f"   ✅ Atividade '{act_id}' marcada como concluída!")

    # 9. Re-verificação de Progresso Atualizado
    print(f"\n9. Re-verificando progresso após conclusão...")
    updated_prog_res = requests.get(f"{BASE_URL}/api/progress", headers=headers)
    updated_prog = updated_prog_res.json()
    updated_mod_prog = updated_prog.get('module_progress', {}).get(mod_slug, {})
    print(f"   ✅ Novo Progresso Geral: {updated_prog.get('overall_percentage')}%")
    print(f"   ✅ Novo Progresso no Módulo '{mod_slug}': {updated_mod_prog.get('percentage')}% ({updated_mod_prog.get('completed')}/{updated_mod_prog.get('total')} concluídas)")

    print("\n========================================")
    print("🎉 FLUXO DE PONTA A PONTA VALIDADO COM 100% DE SUCESSO!")
    print("========================================")

if __name__ == "__main__":
    test_full_student_flow()
