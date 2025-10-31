import React from 'react'
import style from './ButtonScore.module.css';

type ButtonScoreProps = {
    children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>; // Aqui, estamos incluindo todas as propriedades padrão de um botão

export const ButtonScore = ({ children, ...props }: ButtonScoreProps) => { // Espalhando as props diretamente
  return (
    <button
        {...props} 
        className={style.btn_score}
    >
      {children}
    </button>
  )
}
