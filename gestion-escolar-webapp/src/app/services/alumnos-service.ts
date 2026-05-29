import { Injectable } from '@angular/core';
import { ErrorsService } from './tools/errors-service';
import { ValidatorService } from './tools/validator-service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthServices } from './auth-services';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AlumnosService {

  constructor(
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private http: HttpClient,
    private authService: AuthServices
  ) {}

  /** Headers con token */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getSessionToken();
    return token
      ? new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  public esquemaAlumno(){
    return {
      'rol':'',
      'matricula': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'telefono': '',
      'rfc': '',
      'curp': '',
      'edad': '',
      'ocupacion': '',
      'direccion': '',
      'sexo': ''
     
    }
  }

  public validarAlumno(data: any, editar: boolean){
    let error: any = {};

    if(!this.validatorService.required(data["matricula"])){
      error["matricula"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["first_name"])){
      error["first_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["last_name"])){
      error["last_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    }

    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      }

      if(!this.validatorService.required(data["confirmar_password"])){
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if(!this.validatorService.required(data["fecha_nacimiento"])){
      error["fecha_nacimiento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["rfc"])){
      error["rfc"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["curp"])){
      error["curp"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["edad"])){
      error["edad"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["ocupacion"])){
      error["ocupacion"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["direccion"])){
      error["direccion"] = this.errorService.required;
    }
    if(!this.validatorService.required(data["sexo"])){
      error["sexo"] = this.errorService.required;
    }

    return error;
  }
 //Función para registrar un alumno, esta función se llamará en el método registrar() dentro del screen registro-usuarios-screen.ts

  public registrarAlumno(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.url_api}/alumnos/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
 //Función para obtener la lista de alumnos, esta función se llamará en el método cargarAlumnos() dentro del screen lista-alumnos-screen.ts
  public obtenerListaAlumnos(): Observable<any> {
    return this.http.get<any>(
      `${environment.url_api}/lista-alumnos/`,
      { headers: this.getAuthHeaders() }
    );
  }
  //Función para obtener los datos de un alumno por su ID, esta función se llamará en el método cargarAlumno() dentro del screen registro-usuarios-screen.ts cuando se intente editar un alumno
  public obtenerAlumnoPorId(id: number): Observable<any> {
    return this.http.get<any>(
      `${environment.url_api}/alumnos/?id=${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
//función para actualizar los datos de un alumno, esta función se llamará en el método actualizar() dentro del screen registro-usuarios-screen.ts cuando se intente editar un alumno
  public actualizarAlumno(data: any): Observable<any> {
    return this.http.put<any>(
      `${environment.url_api}/alumnos/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
   //Función para eliminar un alumno, esta función se llamará en el método eliminar() dentro del modal eliminar-user-modal.ts
  public eliminarAlumno(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_api}/alumnos/?id=${id}`, { headers: this.getAuthHeaders() });
  }
}