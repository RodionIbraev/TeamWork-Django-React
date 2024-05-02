import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import '../styles/projects.css'

function Projects() {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const responseProjects = await axios.get('http://127.0.0.1:8000/projects/', {
                    headers: {
                        'token': sessionStorage.getItem("accessToken"),
                    }
                });
                setProjects(responseProjects.data);
            } catch (error) {
                console.error('Error fetching projects data:', error);
            }
        };

        const fetchEmployees = async () => {
            try {
                const responseEmployees = await axios.get('http://127.0.0.1:8000/get-employees/', {
                headers: {
                  'token': sessionStorage.getItem("accessToken"),
                }
              });
                setEmployees(responseEmployees.data);
            } catch (error) {
                console.error('не получилось:', error);
            }
        };

        fetchProjects();
        fetchEmployees();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const getEmployeeName = (creatorId) => {
        const creator = employees.find(employee => employee.id === creatorId);
        if (creator) {
            return `${creator.first_name} ${creator.last_name}`;
        }
        return 'Unknown';
    };

    return (
        <div className='projects'>
            <Helmet>
                <title>Просмотр проектов</title>
            </Helmet>
            {projects.map(project => (
              <div key={project.id} className='project-card'>
                <Link key={project.id} to={`/project/${project.id}`} className='project-link'>
                  <div className="card-top">
                    <p>Создатель: {getEmployeeName(project.creator)}</p>
                    <p><strong>{project.name}</strong></p>
                    <p>Создан: {formatDate(project.created_at)}</p>
                  </div>
                  <div className="description">
                    <p>{project.description}</p>
                  </div>
                  </Link>
              </div>
            ))}
        </div>
    );
}

export default Projects;
