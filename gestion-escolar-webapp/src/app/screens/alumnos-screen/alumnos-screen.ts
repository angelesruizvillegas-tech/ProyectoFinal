import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlumnosService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { EliminarUserModal } from '../../modals/eliminar-user-modal/eliminar-user-modal';
@Component({
  selector: 'app-alumnos-screen',
  imports: [
    ...SHARED_IMPORTS,
    MatSortModule
  ],
  templateUrl: './alumnos-screen.html',
  styleUrls: ['./alumnos-screen.scss'],
})
export class AlumnosScreen implements OnInit {

  name_user = '';
  rol = '';
  lista_alumnos: any[] = [];

  displayedColumns = [
    'matricula',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'rfc',
    'editar',
    'eliminar'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (ms) {
      this.sort = ms;
      this.dataSource.sort = this.sort;
    }
  }
  sort!: MatSort;

  constructor(
    private authService: AuthServices,
    private alumnosService: AlumnosService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog:MatDialog
  ) { }

  ngOnInit() {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerAlumnos();
  }
  ngAfterViewInit() {

  }

  public obtenerAlumnos(): void {
    this.alumnosService.obtenerListaAlumnos().subscribe({
      next: (response) => {

        this.lista_alumnos = response;

        this.lista_alumnos.forEach((usuario: any) => {
          usuario.first_name = usuario.user.first_name;
          usuario.last_name = usuario.user.last_name;
          usuario.email = usuario.user.email;
        });

        this.dataSource = new MatTableDataSource(this.lista_alumnos);

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          console.log("SORT:", this.sort);
        });

        this.dataSource.paginator = this.paginator;

        this.dataSource.sortingDataAccessor = (item: any, property: string) => {

          if (property === 'matricula') {
            return Number(item.matricula); // ✅ importante
          }

          if (property === 'nombre') {
            return (item.first_name + ' ' + item.last_name).toLowerCase();
          }

          return item[property];
        };
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const texto = (
            data.matricula +
            data.first_name +
            data.last_name +
            data.email
          ).toLowerCase();

          return texto.includes(filter);
        };
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de alumnos');
      }
    });
  }

  public applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  public goEditar(id: number) {
    this.router.navigate(['/registro-usuarios', 'alumno', id]);
  }

  public delete(idUser: number) {

    const idUserSession = Number(this.authService.getUserId());

    if (this.rol === 'administrador' || (this.rol === 'alumno' && idUserSession === idUser)) {

      const dialogRef = this.dialog.open(EliminarUserModal, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          this.obtenerAlumnos();
        } else {
          this.notificationService.error("Alumno no se ha podido eliminar.");
        }
      });
    } else {
      this.notificationService.error("No tienes permiso para eliminar a este alumno.");
    }
  }
}