import React, { useState } from 'react';
import { Calendar, Car, Phone, User, Wrench, ChevronDown, CheckCircle } from 'lucide-react';
import InputMask from 'react-input-mask';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Функция для преобразования русских букв в латинские аналоги
const convertToLatin = (str: string): string => {
  const cyrillicToLatin: Record<string, string> = {
    'а': 'A', 'в': 'B', 'е': 'E', 'к': 'K', 'м': 'M',
    'н': 'H', 'о': 'O', 'р': 'P', 'с': 'C', 'т': 'T',
    'у': 'Y', 'х': 'X', 'a': 'A', 'b': 'B', 'c': 'C',
    'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'h': 'H',
    'i': 'I', 'j': 'J', 'k': 'K', 'l': 'L', 'm': 'M',
    'n': 'N', 'o': 'O', 'p': 'P', 'q': 'Q', 'r': 'R',
    's': 'S', 't': 'T', 'u': 'U', 'v': 'V', 'w': 'W',
    'x': 'X', 'y': 'Y', 'z': 'Z'
  };

  return str.toLowerCase().split('').map(char => 
    cyrillicToLatin[char] || char.toUpperCase()
  ).join('').replace(/[^A-Z0-9]/g, '');
};

interface FormData {
  name: string;
  phone: string;
  carBrand: string;
  customBrand: string;
  carNumber: string;
  mileage: string;
  nextServiceDate: string;
  serviceDate: string;
  workTypes: string[];
  additionalWork: string;
}

const carBrands = [
  'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Lada', 'Lexus', 
  'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Renault', 
  'Skoda', 'Toyota', 'Volkswagen', 'Volvo'
].sort();

const workTypeOptions = [
  { value: 'oil_engine', label: 'Замена масла двигатель' },
  { value: 'oil_transmission', label: 'Замена масла КПП' },
  { value: 'coolant', label: 'Замена охлаждающей жидкости' },
];

const initialFormData: FormData = {
  name: '',
  phone: '',
  carBrand: '',
  customBrand: '',
  carNumber: '',
  mileage: '',
  nextServiceDate: '',
  serviceDate: '',
  workTypes: [],
  additionalWork: ''
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [phoneError, setPhoneError] = useState('');
  const [mileageError, setMileageError] = useState('');
  const [dateError, setDateError] = useState('');
  const [carNumberError, setCarNumberError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) {
      setPhoneError('Введите корректный номер телефона');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateMileage = (mileage: string) => {
    const num = parseInt(mileage);
    if (isNaN(num) || num <= 0) {
      setMileageError('Пробег должен быть положительным числом');
      return false;
    }
    setMileageError('');
    return true;
  };

  const validateCarNumber = (number: string) => {
    if (number.length < 3) {
      setCarNumberError('Номер должен содержать минимум 3 символа');
      return false;
    }
    setCarNumberError('');
    return true;
  };

  const validateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    if (formData.serviceDate < today) {
      setDateError('Дата ТО не может быть в прошлом');
      return false;
    }
    setDateError('');
    return true;
  };

  const validateForm = () => {
    const isPhoneValid = validatePhone(formData.phone);
    const isMileageValid = validateMileage(formData.mileage);
    const isCarNumberValid = validateCarNumber(formData.carNumber);
    const areDatesValid = validateDates();
    
    if (formData.carBrand === 'other' && !formData.customBrand) {
      setSubmitStatus({
        type: 'error',
        message: 'Пожалуйста, укажите марку автомобиля'
      });
      return false;
    }

    if (!formData.workTypes.length) {
      setSubmitStatus({
        type: 'error',
        message: 'Пожалуйста, выберите хотя бы один вид работ'
      });
      return false;
    }

    return isPhoneValid && isMileageValid && isCarNumberValid && areDatesValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Отправка данных в Supabase
      const { error: supabaseError, data } = await supabase
        .from('car_services')
        .insert([{
          name: formData.name,
          phone: formData.phone,
          car_brand: formData.carBrand === 'other' ? formData.customBrand : formData.carBrand,
          car_number: formData.carNumber,
          mileage: parseInt(formData.mileage),
          next_service_date: formData.nextServiceDate,
          service_date: formData.serviceDate,
          work_types: formData.workTypes,
          additional_work: formData.additionalWork
        }])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message || 'Ошибка при сохранении в базу данных');
      }

      console.log('Успешно сохранено в Supabase:', data);

      // Отправка данных в Netlify Forms
      const formElement = e.target as HTMLFormElement;
      const netlifyFormData = new FormData(formElement);
      
      // Добавим скрытое поле для Netlify
      netlifyFormData.append("form-name", "service-registration");
      
      try {
        const netlifyResponse = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(netlifyFormData as any).toString(),
        });
        
        if (!netlifyResponse.ok) {
          console.warn('Netlify form submission response not OK:', netlifyResponse.status);
        } else {
          console.log('Успешно отправлено в Netlify Forms');
        }
      } catch (netlifyError) {
        console.error('Error submitting to Netlify:', netlifyError);
        // Продолжаем выполнение, так как данные в Supabase уже отправлены
      }

      setSubmitStatus({
        type: 'success',
        message: 'Запись успешно создана!'
      });
      setShowSuccess(true);

      setTimeout(() => {
        setFormData(initialFormData);
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(value)
        ? prev.workTypes.filter(type => type !== value)
        : [...prev.workTypes, value]
    }));
  };

  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = convertToLatin(value);
    setFormData(prev => ({ ...prev, carNumber: value }));
    validateCarNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {showSuccess && (
            <div className="absolute inset-0 bg-green-50 bg-opacity-90 flex flex-col items-center justify-center z-10 transition-opacity duration-500">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-700">Успешно!</h2>
              <p className="text-green-600 mt-2">Ваша запись принята</p>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">B.I.A. Oil</h1>
            <p className="text-gray-600">Запись на техническое обслуживание</p>
          </div>

          {submitStatus.type && !showSuccess && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-netlify="true" name="service-registration">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 mr-2" />
                  Имя
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                />
              </div>

              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Телефон
                </label>
                <InputMask
                  mask="+7 (999) 999-99-99"
                  value={formData.phone}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, phone: e.target.value }));
                    validatePhone(e.target.value);
                  }}
                  className={`block w-full rounded-md border ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5`}
                  required
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                )}
              </div>

              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Car className="w-4 h-4 mr-2" />
                  Марка автомобиля
                </label>
                <div className="relative">
                  <select
                    value={formData.carBrand}
                    onChange={e => setFormData(prev => ({ ...prev, carBrand: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 appearance-none"
                    required
                  >
                    <option value="">Выберите марку</option>
                    {carBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="other">Другое</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {formData.carBrand === 'other' && (
                  <input
                    type="text"
                    value={formData.customBrand}
                    onChange={e => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                    placeholder="Введите марку автомобиля"
                    className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    required
                  />
                )}
              </div>

              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Car className="w-4 h-4 mr-2" />
                  Номер автомобиля (латинские буквы)
                </label>
                <input
                  type="text"
                  value={formData.carNumber}
                  onChange={handleCarNumberChange}
                  className={`block w-full rounded-md border ${
                    carNumberError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 uppercase`}
                  placeholder="ABC123"
                  required
                />
                {carNumberError ? (
                  <p className="mt-1 text-xs text-red-500">{carNumberError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Только латинские буквы (A-Z) и цифры (0-9)
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Wrench className="w-4 h-4 mr-2" />
                  Пробег (км)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.mileage}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, mileage: e.target.value }));
                    validateMileage(e.target.value);
                  }}
                  className={`block w-full rounded-md border ${
                    mileageError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5`}
                />
                {mileageError && (
                  <p className="mt-1 text-xs text-red-500">{mileageError}</p>
                )}
              </div>

              <div className="relative">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Дата следующего ТО
                </label>
                <input
                  type="date"
                  required
                  value={formData.nextServiceDate}
                  onChange={e => setFormData(prev => ({ ...prev, nextServiceDate: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                />
              </div>

              <div className="relative sm:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Желаемая дата ТО
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={formData.serviceDate}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, serviceDate: e.target.value }));
                    validateDates();
                  }}
                  className={`block w-full rounded-md border ${
                    dateError ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5`}
                />
                {dateError && (
                  <p className="mt-1 text-xs text-red-500">{dateError}</p>
                )}
              </div>

              <div className="relative sm:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Wrench className="w-4 h-4 mr-2" />
                  Виды работ
                </label>
                <div className="space-y-2">
                  {workTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.workTypes.includes(option.value)}
                        onChange={() => handleWorkTypeChange(option.value)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дополнительные работы
                  </label>
                  <textarea
                    value={formData.additionalWork}
                    onChange={e => setFormData(prev => ({ ...prev, additionalWork: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                    rows={3}
                    placeholder="Опишите дополнительные работы..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Нажимая кнопку 'Отправить', я даю согласие на обработку персональных данных
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;