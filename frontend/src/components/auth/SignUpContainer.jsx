'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail, Lock, Phone, FileText, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import NotificationModal from '@/components/NotificationModal';

// --- Sorted and Title Cased Sitios ---
const SITIO_OPTIONS = [
  "Aco", "Adelfa", "Campar", "Cyo", "Dons Valley", "Honey Homes",
  "Itamda", "J. Tabura", "Kabulihan", "Kawayan", "La Familia",
  "Lower Lusimba", "Lower Tabucanal", "Mahayahay 1", "Middle Tabucanal",
  "Molave", "Nalupi", "Panas", "Papa Chapel", "Pob. Pardo Proper",
  "Sagrada", "Sto. Niño", "Sunrise", "Upper Tabucanal", "Villa Bayabas"
];

export default function SignUpContainer({ onClose }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('signup');
  const [employmentFile, setEmploymentFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Added Phone State
  
  // States for Dropdowns
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [sitio, setSitio] = useState('');
  
  // Validation States
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState(''); // Added Phone Error State
  const [loginError, setLoginError] = useState('');
  const [notificationModal, setNotificationModal] = useState(null);

  // --- STYLES ---
  const inputStyle = `pl-10 text-base h-11`; 
  const iconStyle = `absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`; 
  
  const dropdownStyle = (value) => `
    w-full border border-gray-200 rounded-lg px-3 h-11 text-base 
    focus:outline-none focus:ring-2 focus:ring-ring focus:border-input bg-white
    ${value ? 'text-black' : 'text-gray-400'}
  `;

  // --- VALIDATION HELPERS ---
  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[^A-Za-z0-9\s]/.test(pwd);
    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  // --- HANDLERS ---
  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setIsPasswordValid(validatePassword(pwd));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  // New Phone Handler
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    
    // Only allow numbers
    const numbersOnly = input.replace(/\D/g, '');

    // Limit to 11 characters (Standard PH format: 09xxxxxxxxx)
    if (numbersOnly.length <= 11) {
      setPhone(numbersOnly);
      
      // Validate Logic
      if (numbersOnly.length > 0) {
        if (!numbersOnly.startsWith('09')) {
          setPhoneError('Must start with 09');
        } else if (numbersOnly.length < 11) {
          setPhoneError('Must be 11 digits');
        } else {
          setPhoneError('');
        }
      } else {
        setPhoneError('');
      }
    }
  };

  const handleLoginInputChange = () => {
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === 'login') {
      // ... Login Logic ...
      const loginData = {
        identifier: document.getElementById('login-identifier').value,
        password: document.getElementById('login-password').value,
      };

      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new CustomEvent('userLogin'));
          onClose();
          if (data.role === 'SUPER_ADMIN') window.location.href = '/superadmin/dashboard';
          else if (data.role === 'ADMIN') window.location.href = '/admin/dashboard';
          else window.location.href = '/dashboard';
        } else {
          setLoginError(data.message || 'Invalid credentials');
        }
      } catch (error) {
        setNotificationModal({ type: 'error', title: 'Network Error', message: 'Please try again.' });
      } finally {
        setLoading(false);
      }
    } else {
      // ... Sign Up Logic ...
      
      // 1. Password Check
      if (!isPasswordValid) {
        setNotificationModal({ type: 'warning', title: 'Invalid Password', message: 'Please ensure your password meets all requirements.' });
        setLoading(false); return;
      }
      if (password !== confirmPassword) {
        setNotificationModal({ type: 'warning', title: 'Password Mismatch', message: 'Passwords do not match.' });
        setLoading(false); return;
      }

      // 2. Phone Check (Strict)
      if (phoneError || phone.length !== 11 || !phone.startsWith('09')) {
        setNotificationModal({ type: 'warning', title: 'Invalid Phone Number', message: 'Please enter a valid Philippine mobile number (e.g., 0917xxxxxxx).' });
        setLoading(false); return;
      }

      const formData = new FormData();
      formData.append('userType', 'user');
      formData.append('firstName', document.getElementById('first-name').value);
      formData.append('lastName', document.getElementById('last-name').value);
      formData.append('middleName', document.getElementById('middle-name').value);
      formData.append('birthDate', birthDate); 
      formData.append('email', document.getElementById('email').value);
      formData.append('password', document.getElementById('password').value);
      
      // Use State for Phone
      formData.append('phoneNumber', phone);
      
      formData.append('region', region);
      formData.append('province', province);
      formData.append('city', city);
      formData.append('barangay', barangay);
      formData.append('sitio', sitio);
      formData.append('addressLine1', document.getElementById('address-line-1').value);
      
      formData.append('gender', gender);

      if (employmentFile) formData.append('validId', employmentFile);

      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setNotificationModal({ type: 'success', title: 'Registration Successful', message: 'Your account is pending approval.', autoClose: true, autoCloseDelay: 5000 });
          setActiveTab('login');
        } else {
          if (data.message && (data.message.includes('Email already registered') || data.message.includes('already exists'))) {
            setEmailError(data.message);
          } else {
            setNotificationModal({ type: 'error', title: 'Registration Failed', message: data.message || 'Registration failed' });
          }
        }
      } catch (error) {
        setNotificationModal({ type: 'error', title: 'Network Error', message: 'Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e) => {
    setEmploymentFile(e.target.files[0]);
  };

  useEffect(() => {
    const handleSwitchToLogin = () => setActiveTab('login');
    const handleSwitchToSignup = () => setActiveTab('signup');
    window.addEventListener('switchToLogin', handleSwitchToLogin);
    window.addEventListener('switchToSignup', handleSwitchToSignup);
    return () => {
      window.removeEventListener('switchToLogin', handleSwitchToLogin);
      window.removeEventListener('switchToSignup', handleSwitchToSignup);
    };
  }, []);

  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className={`bg-white border-gray-200 border rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-[650px] mx-auto md:mx-0 relative min-h-[600px] max-h-[85vh] overflow-y-auto`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
        input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
        }
      `}</style>

      <button onClick={onClose} className={`absolute top-6 right-6 transition-colors text-gray-400 hover:text-gray-600`} aria-label="Close signup form">
        <X size={24} />
      </button>

      <div className="flex justify-center gap-8 mb-8 font-semibold text-lg">
        <button onClick={() => setActiveTab('login')} className={`pb-2 px-2 transition-colors ${activeTab === 'login' ? 'text-[#004AAD] border-b-2 border-[#004AAD]' : `text-gray-500 hover:text-[#004AAD]`}`}>Log In</button>
        <button onClick={() => setActiveTab('signup')} className={`pb-2 px-2 transition-colors ${activeTab === 'signup' ? 'text-[#004AAD] border-b-2 border-[#004AAD]' : `text-gray-500 hover:text-[#004AAD]`}`}>Sign Up</button>
      </div>

      {activeTab === 'login' && (
        <form onSubmit={handleSubmit} className="space-y-6 pl-2 pr-2">
           {/* Login Fields unchanged */}
           <div className="space-y-2">
            <label htmlFor="login-identifier" className={`text-base font-medium text-gray-700`}>Email or Username</label>
            <div className="relative">
              <Mail className={iconStyle} />
              <Input id="login-identifier" type="text" placeholder="Enter your email or username" className={inputStyle} onChange={handleLoginInputChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className={`text-base font-medium text-gray-700`}>Password</label>
            <div className="relative">
              <Lock className={iconStyle} />
              <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" className={`${inputStyle} pr-10`} onChange={handleLoginInputChange} required />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {loginError && (<div className="text-center"><p className="text-xs text-red-600 bg-red-50 p-2 rounded-md">{loginError}</p></div>)}
          <div className="pt-2">
            <Button type="submit" className="w-full bg-[#004AAD] hover:bg-[#003A88] text-white font-semibold rounded-xl h-11 text-lg">Log In</Button>
          </div>
          <div className="text-center pt-2">
            <p className={`text-sm text-gray-600`}>Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="text-[#004AAD] font-semibold hover:underline">Sign Up</button></p>
          </div>
        </form>
      )}

      {activeTab === 'signup' && (
        <form onSubmit={handleSubmit} className="space-y-4 pl-2 pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="first-name" className={`text-base font-medium text-gray-700`}>First Name</label>
              <Input id="first-name" placeholder="First name" className="text-base h-11" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="last-name" className={`text-base font-medium text-gray-700`}>Last Name</label>
              <Input id="last-name" placeholder="Last name" className="text-base h-11" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="middle-name" className={`text-base font-medium text-gray-700`}>Middle Name <span className={`text-gray-500 font-normal`}>(Optional)</span></label>
            <Input id="middle-name" placeholder="Middle name" className="text-base h-11" />
          </div>

          {/* DATE AND GENDER */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="birthdate" className={`text-base font-medium text-gray-700`}>Date of Birth</label>
              <div className="relative group">
                <Calendar className={`${iconStyle} pointer-events-none z-10`} />
                <Input 
                  id="birthdate" 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={maxDate}
                  required 
                  className={`${inputStyle} w-full cursor-pointer appearance-none ${birthDate ? 'text-black' : 'text-gray-400'}`}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="gender" className={`text-base font-medium text-gray-700`}>Gender</label>
              <div className="relative">
                <select 
                  id="gender" 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className={dropdownStyle(gender)}
                >
                  <option value="" disabled>Select</option>
                  <option value="Male" className="text-black">Male</option>
                  <option value="Female" className="text-black">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* REGION AND PROVINCE */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
              <label htmlFor="region" className={`text-base font-medium text-gray-700`}>Region</label>
              <select 
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className={dropdownStyle(region)}
              >
                <option value="" disabled>Select Region</option>
                <option value="Region VII">Region VII</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="province" className={`text-base font-medium text-gray-700`}>Province</label>
              <select 
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className={dropdownStyle(province)}
              >
                <option value="" disabled>Select Province</option>
                <option value="Cebu">Cebu</option>
              </select>
            </div>
          </div>

          {/* CITY AND BARANGAY */}
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
              <label htmlFor="city" className={`text-base font-medium text-gray-700`}>City/Municipality</label>
              <select 
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className={dropdownStyle(city)}
              >
                <option value="" disabled>Select City</option>
                <option value="Cebu City">Cebu City</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="barangay" className={`text-base font-medium text-gray-700`}>Barangay</label>
              <select 
                id="barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                required
                className={dropdownStyle(barangay)}
              >
                <option value="" disabled>Select Barangay</option>
                <option value="Pardo (Pob.)">Pardo (Pob.)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sitio" className={`text-base font-medium text-gray-700`}>Sitio</label>
            <div className="relative">
              <select 
                id="sitio" 
                value={sitio}
                onChange={(e) => setSitio(e.target.value)}
                required
                className={dropdownStyle(sitio)}
              >
                <option value="" disabled>Select Sitio</option>
                {SITIO_OPTIONS.map((option) => (
                  <option key={option} value={option} className="text-black">{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address-line-1" className={`text-base font-medium text-gray-700`}>Address Line</label>
            <Input id="address-line-1" placeholder="House No., Street Name, etc." className="text-base h-11" required />
          </div>

          {/* --- UPDATED PHONE INPUT --- */}
          <div className="space-y-2">
            <label htmlFor="phone" className={`text-base font-medium text-gray-700`}>Phone Number</label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="0917xxxxxxx" 
              value={phone} 
              onChange={handlePhoneChange}
              className={`text-base h-11 ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`} 
              required 
            />
            {phoneError && (<p className="text-xs text-red-600">{phoneError}</p>)}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className={`text-base font-medium text-gray-700`}>Email Address</label>
            <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={handleEmailChange} className={`text-base h-11 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`} required />
            {emailError && (<p className="text-xs text-red-600">{emailError}</p>)}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className={`text-base font-medium text-gray-700`}>Password</label>
            <div className="relative">
              <Lock className={iconStyle} />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={handlePasswordChange} className={`${inputStyle} pr-10 ${password && !isPasswordValid ? 'border-red-500 focus:border-red-500' : ''}`} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className="text-xs space-y-1">
                <p className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>{password.length >= 8 ? '✓' : '✗'} At least 8 characters</p>
                <p className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/[A-Z]/.test(password) ? '✓' : '✗'} One uppercase letter</p>
                <p className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/\d/.test(password) ? '✓' : '✗'} One number</p>
                <p className={`flex items-center gap-2 ${/[^A-Za-z0-9\s]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/[^A-Za-z0-9\s]/.test(password) ? '✓' : '✗'} One special character</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className={`text-base font-medium text-gray-700`}>Confirm Password</label>
            <div className="relative">
              <Lock className={iconStyle} />
              <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onPaste={(e) => e.preventDefault()} className={`${inputStyle} pr-10 ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (<p className="text-xs text-red-600">Passwords do not match</p>)}
          </div>

          <div className="space-y-2">
            <label htmlFor="file-upload" className={`text-base font-medium flex items-center gap-2 text-gray-700`}>
              <FileText className="w-4 h-4" /> Valid ID Document {employmentFile && <CheckCircle className="w-4 h-4 text-green-500" />}
            </label>
            <div className="relative">
              <input id="file-upload" type="file" accept="image/*,application/pdf" onChange={handleFileChange} required className="border border-gray-300 rounded-lg p-2 w-full text-base file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#004AAD] file:text-white hover:file:bg-[#003A88] transition-colors h-11" />
            </div>
            <p className={`text-xs ml-1 text-gray-500`}>Upload a valid government-issued ID (PNG, JPG, or PDF)</p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-[#004AAD] hover:bg-[#003A88] text-white font-semibold rounded-xl h-11 text-lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className={`text-sm text-gray-600`}>Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="text-[#004AAD] font-semibold hover:underline">Log In</button></p>
          </div>
        </form>
      )}

      <NotificationModal isOpen={!!notificationModal} onClose={() => setNotificationModal(null)} type={notificationModal?.type} title={notificationModal?.title} message={notificationModal?.message} autoClose={notificationModal?.autoClose} autoCloseDelay={notificationModal?.autoCloseDelay} />
    </div>
  );
}