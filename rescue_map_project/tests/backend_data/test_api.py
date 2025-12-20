# backend/tests/test_api.py
from django.test import TestCase
from django.urls import reverse
from submissions.models import SOSRequest
import json

class APIMockTests(TestCase):
    def setUp(self):
        # tạo 25 mock SOSRequest
        for i in range(25):
            SOSRequest.objects.create(
                status='PENDING',
                priority='MEDIUM',
                address=f"addr {i}",
                message="mock",
                contact_name=f"name{i}",
                contact_phone=f"0909{i:04d}",
                latitude=10.7 + i*0.001,
                longitude=106.6 + i*0.001,
            )

    def test_sos_list_returns_20_or_more(self):
        url = reverse('emergency:sos-list')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = json.loads(resp.content)
        # if pagination disabled, expect list length >=20
        self.assertGreaterEqual(len(data), 20)
