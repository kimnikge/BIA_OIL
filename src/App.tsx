import React, { useState } from 'react';
import { Calendar, Car, Phone, User, Wrench, ChevronDown, CheckCircle } from 'lucide-react';
import { InputMask } from '@react-input/mask';
import { createClient } from '@supabase/supabase-js';
import { oilTypes } from './data/oilTypes';

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

// Добавляем функцию для получения структуры таблицы
const getTableStructure = async () => {
  try {
    const { data, error } = await supabase
      .from('car_services')
      .select()
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.error('Table car_services does not exist. Please run the schema.sql script.');
      } else {
        console.error('Error fetching table structure:', error);
      }
      return;
    }

    if (data && data[0]) {
      const columns = Object.keys(data[0]);
      console.log('Table structure:', columns);
      
      // Проверка наличия необходимых колонок
      const requiredColumns = ['service_date', 'work_types', 'name', 'phone'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('Missing required columns:', missingColumns);
      }
      
      return columns;
    }
  } catch (err) {
    console.error('Failed to get table structure:', err);
  }
};

// Обновляем интерфейс в соответствии с данными из БД
interface FormData {
  name: string;
  phone: string;
  carBrand: string;
  customBrand: string;
  carNumber: string;
  current_mileage: string;
  last_service_date: string;
  oil_type: string;
  recommended_interval: string;
  master_notes: string;
  service_date: string;
  work_types: string[];
  additional_work: string;
  customOilType?: string;
}

const carBrands = [
  'Audi', 'BMW', 'Changan', 'Chery', 'Chevrolet', 'Exeed', 'Ford', 'Geely', 
  'Great Wall', 'Haval', 'Hongqi', 'Honda', 'Hyundai', 'JAC', 'Kia', 'Lada', 
  'Lexus', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 
  'Renault', 'Skoda', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo', 'Zeekr'
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
  current_mileage: '',
  last_service_date: '',
  oil_type: '',
  recommended_interval: '',
  master_notes: '',
  service_date: '',
  work_types: [],
  additional_work: ''
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

  React.useEffect(() => {
    getTableStructure();
  }, []);

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
    if (formData.service_date < today) {
      setDateError('Дата ТО не может быть в прошлом');
      return false;
    }
    setDateError('');
    return true;
  };

  const validateForm = () => {
    const isPhoneValid = validatePhone(formData.phone);
    const isMileageValid = validateMileage(formData.current_mileage);
    const isCarNumberValid = validateCarNumber(formData.carNumber);
    const areDatesValid = validateDates();
    
    if (formData.carBrand === 'other' && !formData.customBrand) {
      setSubmitStatus({
        type: 'error',
        message: 'Пожалуйста, укажите марку автомобиля'
      });
      return false;
    }

    if (!formData.work_types.length) {
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
      const submissionData = {
        name: formData.name,
        phone: formData.phone,
        car_brand: formData.carBrand === 'other' ? formData.customBrand : formData.carBrand,
        car_number: formData.carNumber,
        current_mileage: parseInt(formData.current_mileage),
        last_service_date: formData.last_service_date || null,
        oil_type: formData.oil_type || null,
        recommended_interval: parseInt(formData.recommended_interval) || null,
        master_notes: formData.master_notes || null,
        service_date: formData.service_date,
        work_types: formData.work_types,
        additional_work: formData.additional_work,
        user_id: null
      };

      const { error: supabaseError, data } = await supabase
        .from('car_services')
        .insert([submissionData])
        .select();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        if (supabaseError.code === '42501') {
          try {
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/car_services`;
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(submissionData)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('REST API error:', errorData);
              throw new Error(errorData.message || 'Ошибка при сохранении через REST API');
            }
            
            const responseData = await response.json();
            console.log('Успешно сохранено через REST API:', responseData);
          } catch (restError) {
            console.error('REST API error:', restError);
            throw new Error('Не удалось сохранить данные. Пожалуйста, проверьте настройки RLS в базе данных.');
          }
        } else {
          throw new Error(supabaseError.message || 'Ошибка при сохранении в базу данных');
        }
      } else {
        console.log('Успешно сохранено в Supabase:', data);
      }

      // Отправка данных в Netlify Forms - комментируем, так как в режиме разработки это вызывает ошибку 404
      /*
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
      */

      // В режиме разработки пропускаем отправку формы в Netlify
      console.log('Отправка в Netlify пропущена в режиме разработки');

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
      work_types: prev.work_types.includes(value)
        ? prev.work_types.filter(type => type !== value)
        : [...prev.work_types, value]
    }));
  };

  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = convertToLatin(value);
    setFormData(prev => ({ ...prev, carNumber: value }));
    validateCarNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20 relative overflow-hidden">
          {showSuccess && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 backdrop-blur-lg flex flex-col items-center justify-center z-10 transition-opacity duration-500">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-white">Успешно!</h2>
              <p className="text-gray-200 mt-2">Ваша запись принята</p>
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">B.I.A. Oil</h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mb-2"></div>
            <p className="text-gray-300 text-lg">Премиальное техническое обслуживание</p>
          </div>

          {submitStatus.type && !showSuccess && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-500 bg-opacity-20 text-green-300' 
                : 'bg-red-500 bg-opacity-20 text-red-300'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" data-netlify="true" name="service-registration">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Обновляем стили для каждого поля ввода, используя группировку для эффектов наведения */}
              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <User className="w-4 h-4 mr-2" />
                  Имя
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Применяем аналогичные стили для остальных полей */}
              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Phone className="w-4 h-4 mr-2" />
                  Телефон
                </label>
                <div className="relative">
                  <InputMask
                    mask="+7 (___) ___-__-__"
                    replacement={{ _: /\d/ }}
                    value={formData.phone}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, phone: e.target.value }));
                      validatePhone(e.target.value);
                    }}
                    className={`block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border ${
                      phoneError ? 'border-red-500' : 'border-gray-600'
                    } group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300`}
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {phoneError && (
                  <p className="mt-1 text-xs text-red-400">{phoneError}</p>
                )}
              </div>

              {/* Обновить стили для остальных полей аналогично */}
              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Car className="w-4 h-4 mr-2" />
                  Марка автомобиля
                </label>
                <div className="relative">
                  <select
                    value={formData.carBrand}
                    onChange={e => setFormData(prev => ({ ...prev, carBrand: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 appearance-none"
                    required
                  >
                    <option value="">Выберите марку</option>
                    {carBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="other">Другое</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {formData.carBrand === 'other' && (
                  <input
                    type="text"
                    value={formData.customBrand}
                    onChange={e => setFormData(prev => ({ ...prev, customBrand: e.target.value }))}
                    placeholder="Введите марку автомобиля"
                    className="mt-2 block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                    required
                  />
                )}
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Car className="w-4 h-4 mr-2" />
                  Номер автомобиля (латинские буквы)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.carNumber}
                    onChange={handleCarNumberChange}
                    className={`block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border ${
                      carNumberError ? 'border-red-500' : 'border-gray-600'
                    } group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 uppercase`}
                    placeholder="ABC123"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {carNumberError ? (
                  <p className="mt-1 text-xs text-red-400">{carNumberError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Только латинские буквы (A-Z) и цифры (0-9)
                  </p>
                )}
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Wrench className="w-4 h-4 mr-2" />
                  Текущий пробег (км)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.current_mileage}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, current_mileage: e.target.value }));
                      validateMileage(e.target.value);
                    }}
                    className={`block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border ${
                      mileageError ? 'border-red-500' : 'border-gray-600'
                    } group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300`}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {mileageError && (
                  <p className="mt-1 text-xs text-red-400">{mileageError}</p>
                )}
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Дата последней замены масла
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.last_service_date}
                    onChange={e => setFormData(prev => ({ ...prev, last_service_date: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Wrench className="w-4 h-4 mr-2" />
                  Тип масла
                </label>
                <div className="relative">
                  <select
                    value={formData.oil_type}
                    onChange={e => setFormData(prev => ({ ...prev, oil_type: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  >
                    <option value="">Выберите масло</option>
                    {oilTypes.map(brand => (
                      <optgroup key={brand.brand} label={brand.brand}>
                        {brand.types.map(type => (
                          <option key={`${brand.brand} ${type}`} value={`${brand.brand} ${type}`}>
                            {type}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="other">Другое</option>
                  </select>
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {formData.oil_type === 'other' && (
                  <input
                    type="text"
                    value={formData.customOilType || ''}
                    onChange={e => setFormData(prev => ({ ...prev, oil_type: e.target.value }))}
                    placeholder="Введите тип масла"
                    className="mt-2 block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                )}
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Wrench className="w-4 h-4 mr-2" />
                  Рекомендованный интервал замены (км)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    value={formData.recommended_interval}
                    onChange={e => setFormData(prev => ({ ...prev, recommended_interval: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="relative group">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Wrench className="w-4 h-4 mr-2" />
                  Примечание мастера
                </label>
                <div className="relative">
                  <textarea
                    value={formData.master_notes}
                    onChange={e => setFormData(prev => ({ ...prev, master_notes: e.target.value }))}
                    className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                    rows={3}
                    placeholder="Дополнительные замечания мастера..."
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="relative group sm:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Желаемая дата ТО
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    required
                    value={formData.service_date}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, service_date: e.target.value }));
                      validateDates();
                    }}
                    className={`block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border ${
                      dateError ? 'border-red-500' : 'border-gray-600'
                    } group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300`}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
                {dateError && (
                  <p className="mt-1 text-xs text-red-400">{dateError}</p>
                )}
              </div>

              <div className="relative group sm:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  <Wrench className="w-4 h-4 mr-2" />
                  Виды работ
                </label>
                <div className="space-y-2">
                  {workTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.work_types.includes(option.value)}
                        onChange={() => handleWorkTypeChange(option.value)}
                        className="rounded border-gray-600 text-blue-500 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    Дополнительные работы
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.additional_work}
                      onChange={e => setFormData(prev => ({ ...prev, additional_work: e.target.value }))}
                      className="block w-full bg-slate-800 bg-opacity-50 text-white rounded-xl border border-gray-600 group-hover:border-blue-400 p-3 shadow-lg focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                      rows={3}
                      placeholder="Опишите дополнительные работы..."
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 w-0 group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-blue-600 bg-opacity-50' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300`}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
              <p className="mt-2 text-xs text-gray-400 text-center">
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