import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { DatosMaestro } from '../../interfaces/usuarios-interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaestrosService } from '../../services/maestros-service';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { EliminarUserModal } from '../../modals/eliminar-user-modal/eliminar-user-modal';
@Component({
  selector: 'app-maestros-screen',
  imports: [
    ...SHARED_IMPORTS,
    MatSortModule
  ],
  templateUrl: './maestros-screen.html',
  styleUrl: './maestros-screen.scss',
})
export class MaestrosScreen implements OnInit {

  public name_user: string = '';
  public rol: string = '';
  public lista_maestros: any[] = [];

  //Declaramos las columnas que se mostrarán en la tabla
  public displayedColumns: string[] = [
    'id_trabajador',
    'nombre',
    'email',
    'campus',
    'sueldo',
    'editar',
    'eliminar'
  ];

  dataSource = new MatTableDataSource<DatosMaestro>([]);

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
    private maestrosService: MaestrosService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerMaestros();
  }

  ngAfterViewInit() {
  }

  //Función para obtener la lista de maestros registrados
  public obtenerMaestros(): void {
    this.maestrosService.obtenerListaMaestros().subscribe({
      next: (response) => {
        this.lista_maestros = response;
        console.log(response);


        this.lista_maestros.forEach((usuario) => {
          usuario.first_name = usuario.user.first_name;
          usuario.last_name = usuario.user.last_name;
          usuario.email = usuario.user.email;
        });
        this.dataSource = new MatTableDataSource(this.lista_maestros)
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 0);
        this.dataSource.paginator = this.paginator;


        this.dataSource.sortingDataAccessor = (item: any, property: string) => {


          if (property === 'id_trabajador') {
            return Number(item.id_trabajador);
          }

          if (property === 'nombre') {
            return (item.first_name + ' ' + item.last_name).toLowerCase();
          }

          return item[property];

        };
        this.dataSource.sort = this.sort;
        console.log(this.sort);



        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const texto = (
            data.id_trabajador +
            data.first_name +
            data.last_name +
            data.email
          ).toLowerCase();

          return texto.includes(filter);
        };
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de maestros');
      }
    });
  }


  //Función para aplicar el filtro de búsqueda en la tabla
  public applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
  public goEditar(idUser: number) {
    this.router.navigate(['/registro-usuarios', 'maestro', idUser]);
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar al maestro
    const idUserSession = Number(this.authService.getUserId());
    // --------- Pero el parámetro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && idUserSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModal, {
        data: { id: idUser, rol: 'maestro' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      //Después de cerrar el modal, se actualiza la lista de maestros para reflejar los cambios
      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          this.obtenerMaestros();
        } else {
          this.notificationService.error("Maestro no se ha podido eliminar.");
        }
      });
    } else {
      //Si no cumple la condición, se muestra un mensaje de error
      this.notificationService.error("No tienes permiso para eliminar a este maestro.");
    }


  }

}