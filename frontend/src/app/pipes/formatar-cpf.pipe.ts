import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'formatarCpf'
})
export class FormatarCpfPipe implements PipeTransform {
    transform(value: string):string {
        if (!value || value.length !== 11) return value;
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}