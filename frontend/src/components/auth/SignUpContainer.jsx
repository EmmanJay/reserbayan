'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail, Lock, Phone, MapPin, FileText, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import NotificationModal from '@/components/NotificationModal';

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
  const [birthDate, setBirthDate] = useState(''); // Added state to track color styling
  const [email, setEmail] = useState('');
  
  // Validation States
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [notificationModal, setNotificationModal] = useState(null);

  const validatePassword = (pwd) => {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[^A-Za-z0-9\s]/.test(pwd);
    return hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setIsPasswordValid(validatePassword(pwd));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleLoginInputChange = () => {
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === 'login') {
      // ... (Login Logic remains the same)
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
      // ... (Validation Logic remains the same)
      if (!isPasswordValid) {
        setNotificationModal({ type: 'warning', title: 'Invalid Password', message: 'Please ensure your password meets all requirements.' });
        setLoading(false); return;
      }
      if (password !== confirmPassword) {
        setNotificationModal({ type: 'warning', title: 'Password Mismatch', message: 'Passwords do not match.' });
        setLoading(false); return;
      }

      const formData = new FormData();
      formData.append('userType', 'user');
      formData.append('firstName', document.getElementById('first-name').value);
      formData.append('lastName', document.getElementById('last-name').value);
      formData.append('middleName', document.getElementById('middle-name').value);
      formData.append('birthDate', birthDate); // Use state value
      formData.append('email', document.getElementById('email').value);
      formData.append('password', document.getElementById('password').value);
      formData.append('phoneNumber', document.getElementById('phone').value);
      formData.append('address', document.getElementById('address').value);
      
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

  // Calculate max date (today) to prevent future birthdates
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className={`bg-white border-gray-200 border rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-[650px] mx-auto md:mx-0 relative min-h-[600px] max-h-[80vh] overflow-y-auto`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* CSS Tricks for the Calendar Input */}
      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
        
        /* Hide the default browser calendar icon so our Custom Lucide icon shows */
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
      `}</style>

      {/* Close Button */}
      <button onClick={onClose} className={`absolute top-6 right-6 transition-colors text-gray-400 hover:text-gray-600`} aria-label="Close signup form">
        <X size={24} />
      </button>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-8 mb-10 font-semibold text-xl">
        <button onClick={() => setActiveTab('login')} className={`pb-3 px-2 transition-colors ${activeTab === 'login' ? 'text-[#004AAD] border-b-3 border-[#004AAD]' : `text-gray-500 hover:text-[#004AAD]`}`}>Log In</button>
        <button onClick={() => setActiveTab('signup')} className={`pb-3 px-2 transition-colors ${activeTab === 'signup' ? 'text-[#004AAD] border-b-3 border-[#004AAD]' : `text-gray-500 hover:text-[#004AAD]`}`}>Sign Up</button>
      </div>

      {/* Log In Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleSubmit} className="space-y-8 pl-4">
           {/* ... Login Inputs (Same as before) ... */}
           <div className="space-y-3">
            <label htmlFor="login-identifier" className={`text-lg font-medium text-gray-700`}>Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input id="login-identifier" type="text" placeholder="Enter your email or username" className="pl-12 text-lg py-4 h-14" onChange={handleLoginInputChange} required />
            </div>
          </div>
          <div className="space-y-3">
            <label htmlFor="login-password" className={`text-lg font-medium text-gray-700`}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="Enter your password" className="pl-12 pr-12 text-lg py-4 h-14" onChange={handleLoginInputChange} required />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {loginError && (<div className="text-center"><p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{loginError}</p></div>)}
          <div className="pt-4">
            <Button type="submit" className="w-full bg-[#004AAD] hover:bg-[#003A88] text-white font-semibold rounded-xl h-14 text-xl">Log In</Button>
          </div>
          <div className="text-center pt-4">
            <p className={`text-gray-600`}>Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="text-[#004AAD] font-semibold hover:underline">Sign Up</button></p>
          </div>
        </form>
      )}

      {/* Sign Up Form */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSubmit} className="space-y-6 pl-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="first-name" className={`text-lg font-medium text-gray-700`}>First Name</label>
              <Input id="first-name" placeholder="First name" className="text-lg py-4 h-14" required />
            </div>
            <div className="space-y-3">
              <label htmlFor="last-name" className={`text-lg font-medium text-gray-700`}>Last Name</label>
              <Input id="last-name" placeholder="Last name" className="text-lg py-4 h-14" required />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="middle-name" className={`text-lg font-medium text-gray-700`}>Middle Name <span className={`text-gray-500 font-normal`}>(Optional)</span></label>
            <Input id="middle-name" placeholder="Middle name" className="text-lg py-4 h-14" />
          </div>

          {/* IMPROVED DATE UI */}
          <div className="space-y-3">
            <label htmlFor="birthdate" className={`text-lg font-medium text-gray-700`}>Date of Birth</label>
            <div className="relative group">
              {/* Custom Icon */}
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none z-10" />
              
              {/* Styled Input */}
              <Input 
                id="birthdate" 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={maxDate} // Prevent future dates
                required 
                className={`
                  pl-12 text-lg py-4 h-14 w-full cursor-pointer appearance-none
                  /* Conditional styling to mimic placeholder behavior */
                  ${birthDate ? 'text-black' : 'text-gray-400'} 
                `}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="address" className={`text-lg font-medium text-gray-700`}>Address</label>
            <Input id="address" placeholder="Enter your address" className="text-lg py-4 h-14" required />
          </div>

          <div className="space-y-3">
            <label htmlFor="phone" className={`text-lg font-medium text-gray-700`}>Phone Number</label>
            <Input id="phone" type="tel" placeholder="Enter phone number" className="text-lg py-4 h-14" required />
          </div>

          <div className="space-y-3">
            <label htmlFor="email" className={`text-lg font-medium text-gray-700`}>Email Address</label>
            <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={handleEmailChange} className={`text-lg py-4 h-14 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`} required />
            {emailError && (<p className="text-sm text-red-600">{emailError}</p>)}
          </div>

          <div className="space-y-3">
            <label htmlFor="password" className={`text-lg font-medium text-gray-700`}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={handlePasswordChange} className={`pl-12 pr-12 text-lg py-4 h-14 ${password && !isPasswordValid ? 'border-red-500 focus:border-red-500' : ''}`} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && (
              <div className="text-sm space-y-1">
                <p className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>{password.length >= 8 ? '✓' : '✗'} At least 8 characters</p>
                <p className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/[A-Z]/.test(password) ? '✓' : '✗'} One uppercase letter</p>
                <p className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/\d/.test(password) ? '✓' : '✗'} One number</p>
                <p className={`flex items-center gap-2 ${/[^A-Za-z0-9\s]/.test(password) ? 'text-green-600' : 'text-red-600'}`}>{/[^A-Za-z0-9\s]/.test(password) ? '✓' : '✗'} One special character</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="confirm-password" className={`text-lg font-medium text-gray-700`}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onPaste={(e) => e.preventDefault()} className={`pl-12 pr-12 text-lg py-4 h-14 ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (<p className="text-sm text-red-600">Passwords do not match</p>)}
          </div>

          <div className="space-y-3">
            <label htmlFor="file-upload" className={`text-lg font-medium flex items-center gap-3 text-gray-700`}>
              <FileText className="w-5 h-5" /> Valid ID Document {employmentFile && <CheckCircle className="w-5 h-5 text-green-500" />}
            </label>
            <div className="relative">
              <input id="file-upload" type="file" accept="image/*,application/pdf" onChange={handleFileChange} required className="border border-gray-300 rounded-lg p-2.5 w-full text-lg file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#004AAD] file:text-white hover:file:bg-[#003A88] transition-colors h-14" />
            </div>
            <p className={`text-base ml-1 text-gray-500`}>Upload a valid government-issued ID (PNG, JPG, or PDF)</p>
          </div>

          <div className="pt-6">
            <Button type="submit" className="w-full bg-[#004AAD] hover:bg-[#003A88] text-white font-semibold rounded-xl h-14 text-xl" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className={`text-gray-600`}>Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="text-[#004AAD] font-semibold hover:underline">Log In</button></p>
          </div>
        </form>
      )}

      <NotificationModal isOpen={!!notificationModal} onClose={() => setNotificationModal(null)} type={notificationModal?.type} title={notificationModal?.title} message={notificationModal?.message} autoClose={notificationModal?.autoClose} autoCloseDelay={notificationModal?.autoCloseDelay} />
    </div>
  );
}