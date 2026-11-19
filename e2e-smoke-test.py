import subprocess, time, urllib.request, json, sys, os, urllib.parse

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 3100
print(f"--- Starting Next.js Production Server on port {PORT} for Portable Live E2E Smoke Test ---")
env = os.environ.copy()
env["PORT"] = str(PORT)
env["ALLOW_MOCK_AUTH"] = "true"

# Start server from repository root
proc = subprocess.Popen(
    ["pnpm", "--filter", "@mandya-realestate/web", "start", "-p", str(PORT)],
    cwd=REPO_ROOT,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

def make_req(path, method="GET", data=None, token=None):
    url = f"http://127.0.0.1:{PORT}{path}"
    headers = {"User-Agent": "E2E-SmokeTest/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = None
    if data:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, content
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        return e.code, content
    except Exception as e:
        return 0, str(e)

# Wait for server to come up
time.sleep(3)
ready = False
for _ in range(15):
    status, _ = make_req("/")
    if status == 200:
        ready = True
        break
    time.sleep(1)

if not ready:
    print("Server failed to start in time.")
    proc.terminate()
    sys.exit(1)

print(" Server is UP and healthy on port", PORT)

test_results = []

def record(name, condition, details=""):
    test_results.append((name, condition, details))
    mark = "✓ PASS" if condition else "✗ FAIL"
    print(f"[{mark}] {name} {details}")

# 1. Homepage & Search
s1, _ = make_req("/")
record("1. Public Homepage (/) returns HTTP 200", s1 == 200)

s2, _ = make_req("/search")
record("2. Public Search (/search) returns HTTP 200", s2 == 200)

# 3. Public API Properties
s3, c3 = make_req("/api/v1/properties?taluk=MANDYA")
data3 = json.loads(c3) if s3 == 200 else {}
record("3. Public Properties API (/api/v1/properties)", s3 == 200 and data3.get("total", 0) > 0, f"- Found {data3.get('total')} properties")

# 4. OTP Request & Verification
s4, c4 = make_req("/api/v1/auth/otp/send", method="POST", data={"phone": "+919845012345"})
record("4. Send Mobile OTP with Phone Normalization", s4 == 200)

s5, c5 = make_req("/api/v1/auth/otp/verify", method="POST", data={"phone": "+919845012345", "code": "123456"})
data5 = json.loads(c5) if s5 == 200 else {}
owner_token = data5.get("token")
record("5. Verify Mobile OTP and issue session token", s5 == 200 and owner_token is not None)

# 6. Auth Me
s6, c6 = make_req("/api/v1/auth/me", token=owner_token)
data6 = json.loads(c6) if s6 == 200 else {}
record("6. Authenticated User Profile (/api/v1/auth/me)", s6 == 200 and data6.get("user", {}).get("phone") == "+919845012345")

# 7. Post New Property (PENDING_APPROVAL)
unique_suffix = int(time.time())
new_prop_title = f"Exclusive-Site-{unique_suffix}"
prop_payload = {
    "titleEn": new_prop_title,
    "titleKn": "ಪರೀಕ್ಷಾ ನಿವೇಶನ",
    "descriptionEn": "Test property created during automated E2E run",
    "descriptionKn": "ಪರೀಕ್ಷಾ ವಿವರಣೆ",
    "category": "PLOT",
    "subType": "RESIDENTIAL_SITE",
    "transactionType": "SALE",
    "priceInr": 2500000,
    "isNegotiable": True,
    "location": {
        "id": "loc-test",
        "taluk": "MANDYA",
        "localityEn": "VV Nagar",
        "localityKn": "ವಿ.ವಿ. ನಗರ",
        "pinCode": "571401",
        "latitude": 12.524,
        "longitude": 76.895
    },
    "addressGranularity": "APPROXIMATE_RADIUS",
    "fuzzedLatitude": 12.524,
    "fuzzedLongitude": 76.895,
    "areaSqft": 1200,
    "plotDimensions": "30x40",
    "waterSource": ["MUNICIPAL_SUPPLY"],
    "approvals": ["MUDA_APPROVED"],
    "media": [{"id": "m1", "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef", "isCover": True, "order": 0}],
    "amenities": ["tar_road"],
    "sellerType": "OWNER",
    "sellerName": "Raghavendra Gowda",
    "sellerPhoneMasked": "+91 98XXX XXXXX",
    "sellerPhoneDirect": "+91 98450 12345",
    "whatsappNumber": "+919845012345"
}

s7, c7 = make_req("/api/v1/properties", method="POST", data=prop_payload, token=owner_token)
data7 = json.loads(c7) if s7 == 201 else {}
created_prop = data7.get("property", {})
created_prop_id = created_prop.get("id")
record("7. Owner Posts Listing -> Status PENDING_APPROVAL", s7 == 201 and created_prop_id is not None and created_prop.get("status") == "PENDING_APPROVAL")

# 8. Check Public Search: Should NOT include pending listing
s8, c8 = make_req(f"/api/v1/properties?q={urllib.parse.quote(new_prop_title)}")
data8 = json.loads(c8) if s8 == 200 else {}
matching = [p for p in data8.get("properties", []) if p.get("id") == created_prop_id]
record("8. Pending Listing is NOT visible in public search", s8 == 200 and len(matching) == 0)

# 9. Admin Authorization Boundary: Regular owner cannot access admin queue
s9, _ = make_req("/api/v1/admin/properties", token=owner_token)
record("9. RBAC: Non-admin is forbidden from admin queue (HTTP 403)", s9 == 403)

# 10. Admin Send OTP & Login
make_req("/api/v1/auth/otp/send", method="POST", data={"phone": "+919900011223"})
s_adm_ver, c_adm = make_req("/api/v1/auth/otp/verify", method="POST", data={"phone": "+919900011223", "code": "123456", "name": "Admin", "role": "ADMIN"})
admin_token = json.loads(c_adm).get("token")

s10, c10 = make_req("/api/v1/admin/properties", token=admin_token)
record("10. Admin accesses moderation queue", s10 == 200 and admin_token is not None)

# 11. Admin Approves Listing
s11, c11 = make_req(f"/api/v1/admin/properties/{created_prop_id}/moderate", method="POST", data={"action": "APPROVE", "reason": "Verified layout documents"}, token=admin_token)
record("11. Admin approves listing -> Status PUBLISHED", s11 == 200 and json.loads(c11).get("status") == "PUBLISHED")

# 12. Dynamic Runtime Resolution: Newly approved listing is NOW in public search
s12, c12 = make_req(f"/api/v1/properties?q={urllib.parse.quote(new_prop_title)}")
data12 = json.loads(c12) if s12 == 200 else {}
matching_after = [p for p in data12.get("properties", []) if p.get("id") == created_prop_id]
record("12. Newly approved property appears in public search immediately", s12 == 200 and len(matching_after) == 1)

# 13. Dynamic Shareable URL Resolution on fresh session (No Rebuild Needed) & SSR Title check
s13, c13 = make_req(f"/property/{created_prop_id}")
record("13. Direct detail URL (/property/[id]) renders dynamically with Title in initial HTML", s13 == 200 and new_prop_title in c13)

# 14. Missing Property returns HTTP 404
s14_missing, _ = make_req("/property/non-existent-prop-999")
record("14. Unavailable property URL returns HTTP 404", s14_missing == 404)

# 15. Publication-aware Sitemap
s15_sitemap, c15_sitemap = make_req("/sitemap.xml")
record("15. Publication-aware sitemap (/sitemap.xml) includes approved listing", s15_sitemap == 200 and created_prop_id in c15_sitemap)

# 16. Seeker Enquiry Submission & Idempotent Retry
enq_payload = {
    "propertyId": created_prop_id,
    "propertyCode": created_prop.get("propertyCode", "MND-TEST"),
    "seekerName": "Suresh Gowda",
    "seekerPhone": "+919740011223",
    "message": "Interested in purchasing."
}
s16, c16 = make_req("/api/v1/enquiries", method="POST", data=enq_payload)
enq_id1 = json.loads(c16).get("enquiry", {}).get("id") if s16 == 201 else None

# Retry with same phone & property
s16_retry, c16_retry = make_req("/api/v1/enquiries", method="POST", data=enq_payload)
enq_id2 = json.loads(c16_retry).get("enquiry", {}).get("id") if s16_retry == 201 else None

record("16. Enquiry Lead submission persists with retry idempotency (no duplicate)", s16 == 201 and enq_id1 == enq_id2)

# 17. Data Isolation: Listing Owner sees the lead; unrelated user does not
s17_owner, c17_owner = make_req("/api/v1/enquiries/my", token=owner_token)
data17_owner = json.loads(c17_owner) if s17_owner == 200 else {}
has_lead = any(e.get("propertyId") == created_prop_id for e in data17_owner.get("received", []))

s17_other, c17_other = make_req("/api/v1/enquiries/my", token=admin_token)
data17_other = json.loads(c17_other) if s17_other == 200 else {}
other_has_lead = any(e.get("propertyId") == created_prop_id for e in data17_other.get("received", []))

record("17. Data Isolation: Only listing owner receives lead (unrelated accounts cannot see)", has_lead and not other_has_lead)

# 18. Seller Pause Action
s18_pause, _ = make_req(f"/api/v1/properties/{created_prop_id}", method="PATCH", data={"status": "PAUSED"}, token=owner_token)
# Paused property should leave public search
s18_search, c18_search = make_req(f"/api/v1/properties?q={urllib.parse.quote(new_prop_title)}")
data18 = json.loads(c18_search) if s18_search == 200 else {}
paused_in_search = any(p.get("id") == created_prop_id for p in data18.get("properties", []))
record("18. Owner Pauses Listing: Successfully transitions to PAUSED and leaves public search", s18_pause == 200 and not paused_in_search)

# 19. Logout and Session Revocation
s19_logout, _ = make_req("/api/v1/auth/logout", method="POST", token=owner_token)
s19_auth_check, _ = make_req("/api/v1/auth/me", token=owner_token)
record("19. Logout & Session Revocation: Token is revoked immediately", s19_logout == 200 and s19_auth_check == 401)

# Clean up server
proc.terminate()
print("\n--- Summary of Live E2E Smoke Tests ---")
all_passed = all(cond for _, cond, _ in test_results)
print(f"Total Tests: {len(test_results)} | Passed: {sum(1 for _, c, _ in test_results if c)} | Failed: {sum(1 for _, c, _ in test_results if not c)}")
if all_passed:
    print(f">>> ALL {len(test_results)} PORTABLE LIVE E2E SMOKE TESTS PASSED CONFIRMED! <<<")
    sys.exit(0)
else:
    print(">>> SOME TESTS FAILED! <<<")
    sys.exit(1)
