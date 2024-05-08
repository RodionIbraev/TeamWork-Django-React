import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/log-reg.css';
import { Helmet } from "react-helmet";
import { X } from 'phosphor-react'

export default function Register({onClose}) {
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);
    const [postNames, setPostNames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        post: ""
    });

    const reloadPage = () => {
        window.location.reload();
    };

    useEffect(() => {
        const fetchPostNames = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/get-post-names/');
                setPostNames(response.data.post_names);
            } catch (error) {
            }
        };

        fetchPostNames();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const closeModal = () => {
        setIsOverlayVisible(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.post) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }

        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/register/", formData);
        
            toast.success("Вы успешно зарегистрировались! Пожалуйста, пройдите авторизацию");
            setTimeout(() => {
                reloadPage();
            }, 2000);

        } catch(error) {
                if (error.response && error.response.data) {
                    Object.keys(error.response.data).forEach(field => {
                    const errorMessage = error.response.data[field];
                    if( errorMessage && errorMessage.length > 0){
                    errorMessage.forEach(msg => {
                        toast.error(msg);
                    });
                }
            });
        }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            {isOverlayVisible && <div className="overlay" onClick={closeModal} />}
            <form method="post" className="form">
                <X size={30} onClick={closeModal} className="close-log-reg"></X>
                <div className="inputs">
                    <label htmlFor="first_name">Имя:</label><br />
                    <input type="text" name="first_name" id="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="inputs">
                    <label htmlFor="last_name">Фамилия:</label><br />
                    <input type="text" name="last_name" id="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="inputs">
                    <label htmlFor="email">Email:</label><br />
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="inputs">
                    <label htmlFor="password">Пароль:</label><br />
                    <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="inputs">
                    <label htmlFor="post">Должность:</label><br />
                    <select name="post" id="post" value={formData.post} onChange={handleChange} required>
                        {postNames.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btnSubmit" disabled={isLoading} onClick={handleSubmit}>Зарегистрироваться</button>
            </form>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}
