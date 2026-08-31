import unittest
from fastapi.testclient import TestClient
import os
import sys

# Garante que o diretório backend está no PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from main import app
import moderation_bot
import gamification_service

client = TestClient(app)

class TestPaliEducaCI(unittest.TestCase):

    def test_health_check(self):
        """Testa endpoint de health check do backend"""
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_list_modules(self):
        """Testa listagem de módulos pedagógicos"""
        response = client.get("/api/modules")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 6)

    def test_moderation_bot_clean_content(self):
        """Testa bot de moderação com texto acadêmico e ético"""
        clean_text = "Manejo adequado de dor e analgesia em idosos com doença terminal."
        is_safe, reason = moderation_bot.check_content(clean_text)
        self.assertTrue(is_safe)
        self.assertEqual(reason, "")

    def test_moderation_bot_profanity_block(self):
        """Testa bloqueio de palavras inadequadas pelo bot de moderação"""
        bad_text = "comentario teste com porra e termos ofensivos"
        is_safe, reason = moderation_bot.check_content(bad_text)
        self.assertFalse(is_safe)
        self.assertIn("Moderação Acadêmica", reason)

    def test_gamification_badge_catalog(self):
        """Testa catálogo oficial de medalhas e critérios de pontuação"""
        self.assertEqual(len(gamification_service.ALL_BADGES_CATALOG), 8)
        badge_keys = [b["key"] for b in gamification_service.ALL_BADGES_CATALOG]
        self.assertIn("first_step", badge_keys)
        self.assertIn("compassionate_communicator", badge_keys)
        self.assertIn("pali_graduate", badge_keys)

    def test_gamification_level_calculation(self):
        """Testa cálculo de níveis de XP pedagógicos"""
        lvl1, title1, next_xp1 = gamification_service.calculate_level(50)
        self.assertEqual(lvl1, 1)
        self.assertIn("Iniciante", title1)

        lvl5, title5, next_xp5 = gamification_service.calculate_level(1200)
        self.assertEqual(lvl5, 5)
        self.assertIn("Mestre", title5)

    def test_forum_posts_listing(self):
        """Testa endpoint público de listagem do fórum"""
        response = client.get("/api/forum/posts")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

if __name__ == "__main__":
    unittest.main()
