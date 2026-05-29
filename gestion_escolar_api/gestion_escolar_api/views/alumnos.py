from django.db.models import *
from django.db import transaction
from gestion_escolar_api.models import Administradores, Maestros
from gestion_escolar_api.serializers import UserSerializer
from gestion_escolar_api.serializers import *
from gestion_escolar_api.models import *
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import Group
from django.shortcuts import get_object_or_404
import json
class AlumnosAll(generics.CreateAPIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        alumnos = Alumnos.objects.filter(user__is_active=1).order_by("id")

        lista = AlumnosSerializer(alumnos, many=True).data

        for alumno in lista:
            if isinstance(alumno, dict) and "materias_array" in alumno:
                try:
                    alumno["materias_array"] = json.loads(alumno["materias_array"])
                except Exception:
                    alumno["materias_array"] = []

        return Response(lista, status=200)

class AlumnosView(generics.CreateAPIView):
    # Permisos por método (sobrescribe el comportamiento default)
    # Verifica que el usuario esté autenticado para las peticiones GET, PUT y DELETE
    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []  # POST no requiere autenticación
    
    #esto es para obtener el alumno específico por su ID
    def get(self, request, *args, **kwargs):
        alumno = Alumnos.objects.filter(id=request.GET.get("id"), user__is_active=1).first()
        if not alumno:
            return Response({"message": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AlumnosSerializer(alumno)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Registrar nuevo usuario
    @transaction.atomic
    def post(self, request, *args, **kwargs):

        user = UserSerializer(data=request.data)
        if user.is_valid():
            #Grab user data
            role = request.data['rol']
            first_name = request.data['first_name']
            last_name = request.data['last_name']
            email = request.data['email']
            password = request.data['password']
            #Valida si existe el usuario o bien el email registrado
            existing_user = User.objects.filter(email=email).first()

            if existing_user:
                return Response({"message":"Username "+email+", is already taken"},400)

            user = User.objects.create( username = email,
                                        email = email,
                                        first_name = first_name,
                                        last_name = last_name,
                                        is_active = 1)


            user.save()
            user.set_password(password)
            user.save()

            group, created = Group.objects.get_or_create(name=role)
            group.user_set.add(user)
            user.save()

            #Create a profile for the user
            alumno = Alumnos.objects.create(user=user,
                                            matricula= request.data["matricula"],
                                            curp= request.data["curp"].upper(),
                                            rfc= request.data["rfc"].upper(),
                                            fecha_nacimiento= request.data["fecha_nacimiento"],
                                            edad= request.data["edad"],
                                            telefono= request.data["telefono"],
                                            ocupacion= request.data["ocupacion"],
                                            direccion = request.data["direccion"],
                                            sexo = request.data["sexo"]
                                            )

            alumno.save()

            return Response({"Alumno creado con ID= ": alumno.id }, 201)

        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        alumno = get_object_or_404(Alumnos, id=request.GET.get("id"))

        try:
            alumno.user.delete()  # elimina usuario también
            return Response({"details": "Alumno eliminado"}, status=200)

        except Exception:
            return Response({"details": "Error al eliminar alumno"}, status=400  )
     # Actualizar datos del Alumno
    @transaction.atomic
    def put(self, request, *args, **kwargs):
        alumno = Alumnos.objects.filter(id=request.data["id"], user__is_active=1).first()
        if not alumno:
            return Response({"message": "Alumno no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user = alumno.user
        # Actualizar campos del usuario
        user.first_name = request.data["first_name"]
        user.last_name = request.data["last_name"]
        #Guardamos los cambios del usuario no es necesario actualizar la contraseña
        user.save()

        # Actualizar campos del administrador
        alumno.matricula = request.data["matricula"]
        alumno.curp = request.data["curp"].upper()
        alumno.rfc = request.data["rfc"].upper()
        alumno.fecha_nacimiento = request.data["fecha_nacimiento"]
        alumno.telefono = request.data["telefono"]
        alumno.edad = request.data["edad"]
        alumno.ocupacion = request.data["ocupacion"]
        alumno.direccion = request.data["direccion"]
        alumno.sexo = request.data["sexo"]
        alumno.save()

        return Response({"message": "Alumno actualizado correctamente"}, status=status.HTTP_200_OK)
       
