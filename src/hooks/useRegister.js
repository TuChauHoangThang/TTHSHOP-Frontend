import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!acceptTerms) {
            setError('Bạn cần đồng ý điều khoản');
            return;
        }
        setError('');
        setLoading(true);
        const result = await register({ name, email, password });
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Đăng ký thất bại');
        }
    };

    return {
        name, setName,
        email, setEmail,
        password, setPassword,
        acceptTerms, setAcceptTerms,
        error,
        loading,
        handleSubmit
    };
};
