import sys
import os

# Adiciona o diretório backend ao sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from database import SessionLocal
import models
from main import app

def test_certificate_validation():
    print("=== Iniciando Teste de Validação Pública de Certificados ===")
    client = TestClient(app)

    db = SessionLocal()
    # Pega o usuário professor/dona (Pedro ou Patricia)
    user = db.query(models.User).filter(models.User.cargo.in_(["dona", "desenvolvedor", "professor"])).first()
    assert user is not None, "Nenhum usuário docente encontrado para teste!"
    valid_code = f"PALI-{user.id:04d}-2026-UFPB"
    db.close()

    # 1. Testar código de docente / concluído válido
    print(f"\n1. Testando validação de certificado autêntico ({valid_code})...")
    res = client.get(f"/api/certificates/validate/{valid_code}")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["student_name"] == user.nome
    assert data["workload_hours"] == 40
    assert "Universidade Federal da Paraíba" in data["institution"]
    print(f"Certificado validado com sucesso: {data['student_name']} - {data['status_label']}")

    # 2. Testar código em minúsculas (insensível a maiúsculas/minúsculas)
    print(f"\n2. Testando validação com código em minúsculas ({valid_code.lower()})...")
    res_lower = client.get(f"/api/certificates/validate/{valid_code.lower()}")
    assert res_lower.status_code == 200
    data_lower = res_lower.json()
    assert data_lower["valid"] is True
    print("Sucesso: código em minúsculas normalizado e autenticado!")

    # 3. Testar código com formato inválido
    print("\n3. Testando código com formato inválido (CODIGO_ERRADO_123)...")
    res_invalid = client.get("/api/certificates/validate/CODIGO_ERRADO_123")
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["valid"] is False
    assert data_invalid["status_label"] == "CÓDIGO INVÁLIDO"
    print(f"Código inválido tratado corretamente: {data_invalid['status_label']}")

    # 4. Testar código de usuário inexistente
    print("\n4. Testando código de ID inexistente (PALI-9999-2026-UFPB)...")
    res_not_found = client.get("/api/certificates/validate/PALI-9999-2026-UFPB")
    assert res_not_found.status_code == 200
    data_not_found = res_not_found.json()
    assert data_not_found["valid"] is False
    assert data_not_found["status_label"] == "NÃO ENCONTRADO"
    print(f"Usuário inexistente tratado corretamente: {data_not_found['status_label']}")

    print("\n🎉 TODOS OS TESTES DE VALIDAÇÃO DE CERTIFICADOS PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    test_certificate_validation()
