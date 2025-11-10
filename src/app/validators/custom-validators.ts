import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Valida CPF brasileiro
   */
  static cpf(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cpf = control.value;
      
      if (!cpf) {
        return null; // Se vazio, deixa o required validar
      }

      // Remove caracteres não numéricos
      const cpfLimpo = cpf.replace(/\D/g, '');

      // Verifica se tem 11 dígitos
      if (cpfLimpo.length !== 11) {
        return { cpfInvalido: { message: 'CPF deve ter 11 dígitos' } };
      }

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpfLimpo)) {
        return { cpfInvalido: { message: 'CPF inválido' } };
      }

      // Validação dos dígitos verificadores
      let soma = 0;
      let resto;

      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
        return { cpfInvalido: { message: 'CPF inválido' } };
      }

      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
        return { cpfInvalido: { message: 'CPF inválido' } };
      }

      return null;
    };
  }

  /**
   * Valida CNPJ brasileiro
   */
  static cnpj(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cnpj = control.value;
      
      if (!cnpj) {
        return null; // Se vazio, deixa o required validar
      }

      // Remove caracteres não numéricos
      const cnpjLimpo = cnpj.replace(/\D/g, '');

      // Verifica se tem 14 dígitos
      if (cnpjLimpo.length !== 14) {
        return { cnpjInvalido: { message: 'CNPJ deve ter 14 dígitos' } };
      }

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
        return { cnpjInvalido: { message: 'CNPJ inválido' } };
      }

      // Validação dos dígitos verificadores
      let tamanho = cnpjLimpo.length - 2;
      let numeros = cnpjLimpo.substring(0, tamanho);
      const digitos = cnpjLimpo.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) {
        return { cnpjInvalido: { message: 'CNPJ inválido' } };
      }

      tamanho = tamanho + 1;
      numeros = cnpjLimpo.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;

      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(1))) {
        return { cnpjInvalido: { message: 'CNPJ inválido' } };
      }

      return null;
    };
  }

  /**
   * Valida telefone brasileiro (com DDD)
   * Formatos aceitos: (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX
   */
  static telefone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const telefone = control.value;
      
      if (!telefone) {
        return null; // Se vazio, deixa o required validar
      }

      // Remove caracteres não numéricos
      const telefoneLimpo = telefone.replace(/\D/g, '');

      // Verifica se tem 10 ou 11 dígitos (DDD + número)
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        return { 
          telefoneInvalido: { 
            message: 'Telefone deve ter 10 ou 11 dígitos (DDD + número)' 
          } 
        };
      }

      // Verifica se o DDD é válido (entre 11 e 99)
      const ddd = parseInt(telefoneLimpo.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        return { telefoneInvalido: { message: 'DDD inválido' } };
      }

      // Se tiver 11 dígitos, o terceiro dígito deve ser 9 (celular)
      if (telefoneLimpo.length === 11) {
        const terceiroDigito = telefoneLimpo.charAt(2);
        if (terceiroDigito !== '9') {
          return { 
            telefoneInvalido: { 
              message: 'Celular deve começar com 9 após o DDD' 
            } 
          };
        }
      }

      return null;
    };
  }

  /**
   * Valida tamanho máximo do nome (entre 3 e 100 caracteres)
   */
  static nomeCompleto(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.value;
      
      if (!nome) {
        return null; // Se vazio, deixa o required validar
      }

      // Remove espaços extras
      const nomeLimpo = nome.trim();

      if (nomeLimpo.length < 3) {
        return { nomeInvalido: { message: 'Nome deve ter pelo menos 3 caracteres' } };
      }

      if (nomeLimpo.length > 100) {
        return { nomeInvalido: { message: 'Nome não pode ter mais de 100 caracteres' } };
      }

      // Verifica se tem pelo menos nome e sobrenome
      const palavras = nomeLimpo.split(' ').filter((p: string) => p.length > 0);
      if (palavras.length < 2) {
        return { nomeInvalido: { message: 'Informe nome e sobrenome' } };
      }

      // Verifica se contém apenas letras e espaços (permite acentos)
      const regexNome = /^[a-zA-ZÀ-ÿ\s]+$/;
      if (!regexNome.test(nomeLimpo)) {
        return { nomeInvalido: { message: 'Nome deve conter apenas letras' } };
      }

      return null;
    };
  }

  /**
   * Valida se a senha é forte
   */
  static senhaForte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const senha = control.value;
      
      if (!senha) {
        return null; // Se vazio, deixa o required validar
      }

      const erros: string[] = [];

      if (senha.length < 8) {
        erros.push('mínimo 8 caracteres');
      }

      if (!/[A-Z]/.test(senha)) {
        erros.push('pelo menos uma letra maiúscula');
      }

      if (!/[a-z]/.test(senha)) {
        erros.push('pelo menos uma letra minúscula');
      }

      if (!/[0-9]/.test(senha)) {
        erros.push('pelo menos um número');
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
        erros.push('pelo menos um caractere especial');
      }

      if (erros.length > 0) {
        return { 
          senhaFraca: { 
            message: `Senha deve ter: ${erros.join(', ')}` 
          } 
        };
      }

      return null;
    };
  }

  /**
   * Valida formato de data de nascimento (não pode ser futuro e idade mínima)
   */
  static dataNascimento(idadeMinima: number = 18): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const data = control.value;
      
      if (!data) {
        return null;
      }

      const dataNasc = new Date(data);
      const hoje = new Date();
      
      // Verifica se é uma data válida
      if (isNaN(dataNasc.getTime())) {
        return { dataInvalida: { message: 'Data inválida' } };
      }

      // Verifica se não é futuro
      if (dataNasc > hoje) {
        return { dataInvalida: { message: 'Data de nascimento não pode ser futura' } };
      }

      // Calcula idade
      let idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = dataNasc.getMonth();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataNasc.getDate())) {
        idade--;
      }

      if (idade < idadeMinima) {
        return { 
          idadeInvalida: { 
            message: `Idade mínima é ${idadeMinima} anos` 
          } 
        };
      }

      // Verifica se a idade é razoável (máximo 120 anos)
      if (idade > 120) {
        return { dataInvalida: { message: 'Data de nascimento inválida' } };
      }

      return null;
    };
  }
}
