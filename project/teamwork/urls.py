"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path("", views.home, name="home")
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path("", Home.as_view(), name="home")
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path("blog/", include("blog.urls"))
"""
from django.urls import path

from .views import (RegisterView, LoginView, LogoutView, TaskView, ProjectView, UserProfileView, EventSchedulerView,
                    GetEmployeesView, GetTaskChoicesView, GetPostNamesView)

urlpatterns = [
    path("get-employees/", GetEmployeesView.as_view(), name="get-employees"),
    path("get-employees/<str:project_id>/", GetEmployeesView.as_view(), name="get-project-employees"),
    path("get-post-names/", GetPostNamesView.as_view(), name="get-post-names"),
    path("get-task-choices/", GetTaskChoicesView.as_view(), name="get-task-choices"),

    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("user-profile/", UserProfileView.as_view(), name="user-profile"),

    path("project/create", ProjectView.as_view(), name="create-project"),
    path("project/delete/<str:project_id>/", ProjectView.as_view(), name="delete-project"),
    path("projects/", ProjectView.as_view(), name="view-projects"),
    path("project/<str:project_id>/", ProjectView.as_view(), name="view-board"),

    path("project/<str:project_id>/task-create/", TaskView.as_view(), name="task-create"),
    path("task-delete/<str:task_id>/", TaskView.as_view(), name="task-delete"),
    path("user-tasks/", TaskView.as_view(), name="user-tasks"),

    path("event-scheduler/", EventSchedulerView.as_view(), name="event-scheduler"),
    path("event-scheduler/create", EventSchedulerView.as_view(), name="event-scheduler-create"),
]
