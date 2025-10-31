// ** Types
import React from 'react';

type RepeaterProps = {
  count: number;
  tag?: React.ElementType; // Define `tag` como React.ElementType para uso como componente JSX
  children: (index: number) => React.ReactNode;
};

const Repeater: React.FC<RepeaterProps> = ({ count, tag: Tag = 'div', children, ...rest }) => {
  // ** Default Items
  const items = [];

  // ** Loop count vezes e adiciona itens ao array
  for (let i = 0; i < count; i++) {
    items.push(children(i));
  }

  // Renderiza o componente Tag com os itens como filhos
  return <Tag {...(rest as React.ComponentProps<any>)}>{items}</Tag>;
};

export default Repeater;