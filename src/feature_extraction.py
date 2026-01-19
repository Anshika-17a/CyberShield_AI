# src/feature_extraction.py
import re
import math
from urllib.parse import urlparse

class URLFeatureExtractor:
    def __init__(self, url):
        self.url = url
        self.domain = ""
        self.path = ""
        try:
            parsed = urlparse(url)
            self.domain = parsed.netloc
            self.path = parsed.path
        except:
            self.domain = ""
            self.path = ""

    def calculate_entropy(self, text):
        """Calculates Shannon Entropy (randomness) of a string."""
        if not text:
            return 0
        entropy = 0
        for x in range(256):
            p_x = float(text.count(chr(x))) / len(text)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy

    def get_features(self):
        features = []
        
        # --- STRUCTURAL FEATURES ---
        
        # 1. Length of URL
        features.append(len(self.url))
        
        # 2. Length of Domain
        features.append(len(self.domain))
        
        # 3. Count of Dots (.)
        features.append(self.url.count('.'))
        
        # 4. Count of '@' (Obfuscation)
        features.append(self.url.count('@'))
        
        # 5. Count of Directory / (Depth of URL)
        features.append(self.url.count('/'))
        
        # 6. Count of Hyphens (-) in Domain (Phishers love these: secure-bank-login)
        features.append(self.domain.count('-'))

        # --- MATHEMATICAL FEATURES ---
        
        # 7. Shannon Entropy of Domain (The chaos score)
        features.append(self.calculate_entropy(self.domain))
        
        # 8. Digit to Letter Ratio (Phishing URLs often have more numbers)
        total_chars = len(self.url)
        digit_count = sum(c.isdigit() for c in self.url)
        features.append(digit_count / total_chars if total_chars > 0 else 0)

        # --- KEYWORD FEATURES ---
        
        # 9. Is IP Address?
        ip_pattern = r'(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])'
        features.append(1 if re.search(ip_pattern, self.url) else 0)
        
        # 10. Suspicious Words Count (Expanded List)
        sus_words = ['login', 'secure', 'account', 'update', 'banking', 'verify', 'wallet', 'confirm', 'bonus', 'free']
        features.append(sum(1 for word in sus_words if word in self.url.lower()))
        
        # 11. Sensitive Extension (.exe, .php, etc usually bad in links)
        bad_ext = ['.exe', '.php', '.bat', '.cmd']
        features.append(1 if any(self.url.endswith(ext) for ext in bad_ext) else 0)
        
        # 12. Shortening Service? (bit.ly etc often hide danger)
        shorteners = ['bit.ly', 'goo.gl', 'tinyurl', 'ow.ly', 'is.gd']
        features.append(1 if any(s in self.domain for s in shorteners) else 0)

        return features

# Test it
if __name__ == "__main__":
    # Compare a good site vs a bad site
    good = "http://google.com"
    bad = "http://secure-login.update-bank-info.com@192.168.1.55/verify.php"
    
    print(f"Features for Good: {URLFeatureExtractor(good).get_features()}")
    print(f"Features for Bad : {URLFeatureExtractor(bad).get_features()}")