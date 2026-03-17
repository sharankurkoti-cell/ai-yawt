# 🧪 LOCAL TESTING GUIDE

## 🎯 **Step-by-Step Testing Instructions**

### **1. Start Development Server**
```bash
cd frontend
npm run dev
```

### **2. Open Browser Automatically**
The dev server should automatically open `http://localhost:3000` in your default browser.

### **3. If It Doesn't Open Automatically:**
- **Manually open**: `http://localhost:3000`
- **Check console**: Press F12 to see any errors
- **Look for success message**: "VITE vX.X.X ready in XXXms"

### **4. Test Email Verification Flow**
1. **Click "Sign In"** button in navbar
2. **Click "Create Account"** tab
3. **Enter test email**: `test-user123@example.com`
4. **Enter password**: `TestPassword123!`
5. **Click "Sign Up"**
6. **Check console** for verification message
7. **Check email** (should arrive in 1-5 minutes)

### **5. Test Download Flow**
1. **Sign in** with verified account
2. **Go to Download page**: Click "Download" in navbar
3. **Check authentication** - Should verify email requirement
4. **Click download button** - Should start download
5. **Check file** - Look for `YawtAI-Portable-1.0.0.exe`

---

## 🔍 **Debug Tools Available**

### **4 Debug Buttons** (Top-left of AuthModal)
1. 🟡 **Debug** - Basic email diagnostics
2. 🧪 **Test** - Comprehensive email system test
3. 📧 **Analyze** - Email provider analysis
4. 🔍 **Diagnose** - Loading issue diagnostics

### **How to Use:**
1. **Open AuthModal** → Click "Sign In"
2. **Click debug buttons** → Run comprehensive tests
3. **Check console** → Look for diagnostic results
4. **Follow recommendations** → Apply suggested fixes

---

## 🚀 **Expected Results**

### **Successful Test:**
```
✅ Environment: development
✅ Supabase Connection: SUCCESS
✅ Email Service: SUCCESS
✅ Database Connection: SUCCESS
✅ Test signup: SUCCESS
✅ Verification email sent
```

### **If Issues Occur:**
```
❌ Environment: NOT CONFIGURED
❌ Supabase Connection: FAILED
❌ Email Service: FAILED
❌ Database Connection: FAILED
```

---

## 🎯 **Quick Fixes**

### **Common Issues & Solutions:**

| Issue | Solution |
|--------|----------|
| Server not starting | Check Node.js version, clear cache |
| Browser not opening | Manually open localhost:3000 |
| Email not arriving | Check spam folders, try Gmail |
| Download not working | Check authentication, verify email |
| Debug tools not working | Check console for errors |

---

## 📊 **What to Check**

### **Before Testing:**
- [ ] Node.js 18+ installed? (`node --version`)
- [ ] npm dependencies installed? (`npm ls`)
- [ ] Port 3000 available? (`netstat -an | findstr :3000`)
- [ ] Browser console clear? (F12 → Network tab)

### **After Testing:**
- [ ] Development server running without errors?
- [ ] Can access localhost:3000?
- [ ] Email verification working?
- [ ] Download functionality working?
- [ ] Debug tools functioning?

---

## 🎉 **Success Indicators**

### **Working System:**
- ✅ **HMR updates** - Changes apply immediately
- ✅ **No console errors** - Clean compilation
- ✅ **Email verification** - Test emails sent
- ✅ **Download protection** - Authentication working
- ✅ **Debug tools** - Comprehensive diagnostics

---

**Follow the step-by-step guide to test your system locally!** 🚀

*YawtAI - Your AI Software Engineer*  
*Built with ❤️ by Yawt Technologies LLC*
