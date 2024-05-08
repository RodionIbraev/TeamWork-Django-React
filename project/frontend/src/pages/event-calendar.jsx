import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru';
import '../styles/event-calendar.css'
import { X } from 'phosphor-react'

moment.locale('ru');

const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Весь день',
    previous: 'Назад',
    next: 'Вперед',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    agenda: 'События дня',
    date: 'Дата',
};

const EventCalendar = () => {
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        time_begin: '',
        time_end: ''
    });
    const [events, setEvents] = useState([]);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEvent(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const reloadPage = () => {
        window.location.reload();
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
    
        if (!newEvent.name || !newEvent.time_begin|| !newEvent.time_end) {
            toast.error("Пожалуйста, заполните все обязательные поля");
            return;
        }
    
        try {
            const response = await axios.post(`http://127.0.0.1:8000/event-scheduler/create`, newEvent, {
                headers: {
                    'token': sessionStorage.getItem("accessToken"),
                }
            });
            
            toast.success("Событие создано!");
            setTimeout(() => {
                reloadPage();
            }, 2000);
            
        } catch (error) {
            if (error.response && error.response.data) {
                Object.keys(error.response.data).forEach(field => {
                    const errorMessage = error.response.data[field];
                    if (errorMessage && errorMessage.length > 0) {
                        errorMessage.forEach(msg => {
                            toast.error(msg);
                        });
                    }
                });
            }
        }
    };
    useEffect(() => {
        const getEvents = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/event-scheduler/', {
                    headers: {
                        'token': sessionStorage.getItem("accessToken"),
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
            }
        };

        getEvents();
    }, []);

    const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.name,
        start: new Date(event.time_begin),
        end: new Date(event.time_end),
    }));

    const upcomingEvents = formattedEvents.filter(event => moment(event.start) > moment());

    return (
        <div>
        <h1 style={{color: 'var(--white-color)'}}>КАЛЕНДАРЬ СОБЫТИЙ</h1>
        <div className='event-calendar'>
        <div style={{ height: '840px', width: '1500px', marginTop: '30px' }}>
            <Calendar
                localizer={localizer}
                events={formattedEvents}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                style={{ maxWidth: '90%', margin: 'auto' }}
            />
        </div>
        <div className="event-calendar-list">
        <button className='task-btn' onClick={openModal}>Создать событие</button>
            <h3>Предстоящие события:</h3>
                <ul>
                    {upcomingEvents.map(event => (
                         <div key={event.id} className="event-item">
                         <p><strong>{event.title}</strong></p>
                         <p><strong>Дата начала:</strong> {moment(event.start).format('DD.MM.YYYY HH:mm')}</p>
                         <p><strong>Дата окончания:</strong> {moment(event.end).format('DD.MM.YYYY HH:mm')}</p>
                         <p><strong>Дата создания:</strong> {moment(event.createdAt).format('DD.MM.YYYY HH:mm')}</p>
                     </div>
                    ))}
                </ul>
        </div>
        {showModal && (
            <div className="task-modal">
                <div className="modal-content">
                <X size={30} onClick={closeModal} className='close-task-window'/> 
                    <h2>Создать событие</h2>
                    <div className="inputs">
                        <label htmlFor="name">Название</label><br />
                        <input type="text" name="name" value={newEvent.name} onChange={handleChange} />
                    </div>
                    <div className="inputs">
                        <label htmlFor="time_begin">Дата начала</label><br />  
                        <input type="datetime-local" name="time_begin" value={newEvent.time_begin} onChange={handleChange} />
                    </div>
                    <div className="inputs">
                        <label htmlFor="time_end">Дата окончания</label><br /> 
                        <input type="datetime-local" name="time_end" value={newEvent.time_end} onChange={handleChange} />
                    </div>
                    <button onClick={handleCreateEvent} className='btnSubmit'>Создать</button>
                </div>
            </div>
        )}
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
        </div>
    );
};

export default EventCalendar;