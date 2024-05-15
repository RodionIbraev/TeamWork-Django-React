from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from teamwork.serializers import ProjectSerializer
from teamwork.views.auxiliary import get_user, auth_required

from teamwork.models import Project, Task
from teamwork.logic.yandex_api import YandexAPI

TOKEN = getattr(settings, "YANDEX_TOKEN")


class ProjectView(APIView):
    serializer_class = ProjectSerializer

    @staticmethod
    def _get_project(project_id):
        return Project.objects.get(id=project_id)

    @auth_required
    def post(self, request):
        """
        Создание проекта
        """
        user = get_user(request)
        req_data = request.data.copy()
        req_data["creator"] = user.id
        serializer = self.serializer_class(data=req_data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @auth_required
    def get(self, request, project_id=None):
        """
        Просмотр проекта
        """
        user = get_user(request)
        if project_id:
            try:
                project = self._get_project(project_id)
            except Project.DoesNotExist:
                return Response(status=404, data={"message": f"Проект с id {project_id} не найден!"})
            project_serializer = self.serializer_class(project)
            return Response(project_serializer.data)
        else:
            projects = Project.objects.filter(Q(employee=user) | Q(creator=user)).distinct()
            project_serializer = self.serializer_class(projects, many=True)
            return Response(project_serializer.data)

    @auth_required
    def delete(self, request, project_id=None):
        """
        Удаление проекта
        """
        response = Response()
        if project_id:
            project = self._get_project(project_id)
            project.delete()
            response.data = {
                "success_message": "Проект успешно удалён!",
            }
            return response


class DocsForProjectView(APIView):
    yandex = YandexAPI(TOKEN)

    @staticmethod
    def _get_project(project_id):
        return Project.objects.get(id=project_id)

    @auth_required
    def get(self, request, project_id):
        """
        Просмотр и загрузка документов проекта
        """
        project = self._get_project(project_id)
        file_list = self.yandex.get_file_list()
        document_names = []
        document_urls = []
        for file in file_list["items"]:
            if f"{project.name}" in file["path"]:
                document_names.append(file["name"])
                document_urls.append(file["file"])
        response = Response()
        response.data = dict(zip(document_names, document_urls))
        return response

    # @auth_required
    # def post(self, request, project_id):
    #     """
    #     Добавление документа к проекту
    #     """
    #     project = self._get_project(project_id)
    #     upload_file_to_yandex = self.yandex.upload_file_to_yandex(f"projects/{project.name}", )  # правильно задать имя
    #     # файлу
    #     return upload_file_to_yandex

    # @auth_required
    # def delete(self, request, project_id):
    #     """
    #     Удаление документа из проекта
    #     """
    #     file_list = self.yandex.delete_from_yandex(disk_file_path)
    #     return None
