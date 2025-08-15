import os
import sys
import requests
import random
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv('GHASEDAK_API_KEY')
TEMPLATE_NAME = os.getenv('GHASEDAK_TEMPLATE_NAME', 'ghasedak2')
OTP_ENDPOINT = 'https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams'
USE_PROXY = os.getenv('USE_PROXY', '0') == '1'
PROXY_FMT = os.getenv('PROXY_FMT', 'http://jjebraham-{n}:Amir1234@p.webshare.io:80')
PROXY_POOL = list(range(1, 101))

def test_otp_send():
    if not API_KEY:
        print('ERROR: GHASEDAK_API_KEY not found')
        return False
    
    if not TEMPLATE_NAME:
        print('ERROR: GHASEDAK_TEMPLATE_NAME not found')
        return False
    
    print('Testing OTP send with updated proxy configuration...')
    print(f'API Key: {API_KEY[:20]}...')
    print(f'Template: {TEMPLATE_NAME}')
    print(f'Proxy Format: {PROXY_FMT}')
    print(f'USE_PROXY: {USE_PROXY}')
    
    # Test with a dummy phone number
    phone = '09123456789'
    code = str(random.randint(100000, 999999))
    
    headers = {
        'accept': 'text/plain',
        'ApiKey': API_KEY,
        'Content-Type': 'application/json',
    }
    
    payload = {
        'receptors': [{'mobile': phone, 'clientReferenceId': 'test'}],
        'templateName': TEMPLATE_NAME,
        'param1': code,
        'param2': '', 'param3': '', 'param4': '', 'param5': '',
        'param6': '', 'param7': '', 'param8': '', 'param9': '', 'param10': '',
        'isVoice': False,
        'udh': False,
    }
    
    proxies = {}
    proxy_url = ''
    
    if USE_PROXY:
        n = PROXY_POOL[0]
        proxy_url = PROXY_FMT.format(n=n)
        proxies = {'http': proxy_url, 'https': proxy_url}
        print(f'Using proxy: {proxy_url}')
    
    try:
        print('Sending request...')
        response = requests.post(
            OTP_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=(20, 30),
            proxies=proxies
        )
        
        print(f'Response status: {response.status_code}')
        print(f'Response text: {response.text[:200]}...')
        
        try:
            data = response.json()
            print(f'Response JSON: {data}')
        except:
            print('Could not parse JSON response')
            
        return response.status_code == 200
        
    except Exception as e:
        print(f'Error: {e}')
        return False

if __name__ == '__main__':
    success = test_otp_send()
    print(f'Test result: { SUCCESS if success else FAILED}')
