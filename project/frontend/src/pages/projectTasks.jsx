import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TaskCreate from '../components/task-create.jsx';
import '../styles/project-tasks.css';
import { User } from 'phosphor-react';
import { BsExclamationCircle, BsCalendar2Check } from "react-icons/bs";
import { FaInfoCircle, FaCommentDots } from "react-icons/fa";
import { Helmet } from 'react-helmet';
import TaskModal from '../components/task-modal.jsx';
import TaskComments from '../components/task-comments.jsx';
import { ToastContainer, toast } from 'react-toastify';

function ProjectTasks() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [statusNames, setStatusNames] = useState([]);
    const [showTaskCreate, setShowTaskCreate] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedCommentTaskId, setSelectedCommentTaskId] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);


    useEffect(() => {
        const fetchTaskChoices = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/get-task-choices/', {
                    headers: {
                        'token': sessionStorage.getItem("accessToken"),
                    }
                });
                setStatusNames(response.data.status_names);
            } catch (error) {
            }
        };

        fetchTaskChoices();
    }, []);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const [responseProject, responseEmployees] = await Promise.all([
                    axios.get(`http://127.0.0.1:8000/project/${projectId}`, {
                        headers: {
                            'token': sessionStorage.getItem("accessToken"),
                        }
                    }),
                    axios.get('http://127.0.0.1:8000/get-employees/', {
                        headers: {
                            'token': sessionStorage.getItem("accessToken"),
                        }
                    })
                ]);
                setProject(responseProject.data);
                setEmployees(responseEmployees.data);
            } catch (error) {
            }
        };

        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    const handleExportToXLSX = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/project/${projectId}/export/`, {
                headers: {
                    'token': sessionStorage.getItem("accessToken"),
                },
                responseType: 'blob'
            });
    
            const projectTitle = project.name.replaceAll(' ', '_');
            const fileName = `${projectTitle}_export.xlsx`; 

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
    
            link.setAttribute('download', fileName);
    
            document.body.appendChild(link);
            link.click();
    
            link.parentNode.removeChild(link);

            toast.success("Файл загружен!");
        } catch (error) {
        }
    };

    if (!project || statusNames.length === 0) {
        return <div>Loading...</div>;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const getEmployeeName = (executorId) => {
        const executor = employees.find(employee => employee.id === executorId);
        if (executor) {
            return `${executor.first_name} ${executor.last_name}`;
        }
        return 'Unknown';
    };

    const getTaskById = async (taskId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/task/${taskId}/`, {
                headers: {
                    'token': sessionStorage.getItem("accessToken"),
                }
            });
            setSelectedTask({...response.data, task_id: taskId});
        } catch (error) {

        }
    };

    const handleTaskClick = (taskId) => {
        setSelectedTaskId(taskId);
        getTaskById(taskId);
    };

    const handleCommentClick = (taskId) => {
        setSelectedCommentTaskId(taskId);
        setShowCommentsModal(true);
    };

    const handleCloseModal = () => {
        setSelectedTaskId(null);
        setSelectedTask(null);
        setShowTaskCreate(null);
        setSelectedCommentTaskId(null);
        setShowCommentsModal(false);
    };

    return (
        <div className='project-tasks'>
            <Helmet>
                <title>Задачи проекта "{project.name}"</title>
            </Helmet>
            <div className="task-btns">
                <button className='task-btn'>Список сотрудников</button>
                <button className='task-btn' onClick={handleExportToXLSX}>Экспорт в XLSX</button>
                <button className='task-btn' onClick={() => setShowTaskCreate(true)}>Создать задачу</button>
            </div>
            {showTaskCreate && (
                <TaskCreate 
                    onClose={handleCloseModal}
                />
            )}

            <div className='status-card-all'>
                {statusNames.map(status => (
                    <div key={status} className='status-card'>
                        <div className='status-name'>{status}</div>
                        {project.tasks.filter(task => task.status === status).map(task => (
                            <div key={task.id} className={task.priority === 'Важный' ? 'task-card high' : task.priority === 'Срочный' ? 'task-card highest' : 'task-card default'}>
                                <h4>{task.name}</h4>
                                <div className="task-info">
                                    <div className="parent-element">
                                        <BsCalendar2Check size={25} weight="bold" />
                                        <p>{formatDate(task.deadline)}</p>
                                    </div>
                                    <div className="parent-element">
                                        <BsExclamationCircle size={25} weight="bold" />
                                        <p>{task.priority}</p>
                                    </div>
                                    <div className="parent-element">
                                        <User size={25} weight="bold" />
                                        <p>{getEmployeeName(task.executor_id)}</p>
                                    </div>
                                    <div className="task-info-click">
                                        <FaCommentDots size={25} onClick={() => handleCommentClick(task.id)} />
                                        <FaInfoCircle size={25} onClick={() => handleTaskClick(task.id)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {showCommentsModal && selectedCommentTaskId && (
                <TaskComments
                    taskId={selectedCommentTaskId}
                    taskName={project.tasks.find(task => task.id === selectedCommentTaskId)?.name}
                    onClose={handleCloseModal}
                    employees={employees}
                />
            )}
            {selectedTaskId && (
                <TaskModal
                    task={selectedTask}
                    formatDate={formatDate}
                    getEmployeeName={getEmployeeName}
                    onClose={handleCloseModal}
                    showEditButton={true}
                    modalSize="large"
                />
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
    );
}


export default ProjectTasks;