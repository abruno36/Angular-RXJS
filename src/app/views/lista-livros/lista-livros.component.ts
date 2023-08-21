import { Component } from '@angular/core';
import { switchMap, filter, throwError, tap, map, catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { Item, LivrosResultado } from 'src/app/models/interfaces';
import { LivroVolumeInfo } from 'src/app/models/livroVolumeInfo';
import { LivroService } from '../../service/livro.service';
import { FormControl } from '@angular/forms';

const PAUSA = 300;
@Component({
  selector: 'app-lista-livros',
  templateUrl: './lista-livros.component.html',
  styleUrls: ['./lista-livros.component.css']
})
export class ListaLivrosComponent {
  campoBusca = new FormControl()
  livrosResultado: LivrosResultado;
  mensagemErro = '';

  constructor(private service: LivroService) { }

  totalDeLivros$ = this.campoBusca.valueChanges
    .pipe(
        debounceTime(PAUSA),
        filter((valorDigitado) => valorDigitado.length >= 3),
        tap(() => console.log('Fluxo inicial')),
        switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
        map(resultado => this.livrosResultado = resultado),
        catchError(erro => {
            console.log(erro)
            return of()
        })
    )

  livrosEncontrados$ = this.campoBusca.valueChanges
    .pipe(
      //debounceTime(PAUSA),
      filter((valorDigitado) => valorDigitado.length >= 3),
      tap(() => console.log('Fluxo inicial')),
      distinctUntilChanged(),
      switchMap((valorDigitado) => this.service.buscar(valorDigitado)),
      map(resultado => this.livrosResultado = resultado),
      tap((retornoAPI) => console.log(retornoAPI)),
      map(resultado => resultado.items ?? []),
      map((items) => this.livrosResultadoParaLivros(items)),
      catchError((erro) => {
        console.log(erro)
        return throwError(() => new Error(this.mensagemErro ='Ops, ocorreu um erro. Recarregue a aplicação!'))
      })
    )

  livrosResultadoParaLivros(items: Item[]): LivroVolumeInfo[] {
    return items.map(item => {
      return new LivroVolumeInfo(item)
    })
  }

}




