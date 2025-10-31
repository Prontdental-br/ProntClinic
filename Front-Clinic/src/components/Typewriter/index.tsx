import React, { useState, useEffect, ReactNode } from 'react';

interface Props {
  text: string,
  delay: number,
  callback?: () => void,
}

const Typewriter = ({ text, delay, callback }: Props) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
  
      return () => clearTimeout(timeout);
    }
    if (currentIndex === text.length && callback !== undefined) {
      callback();
    }
  }, [currentIndex, delay, text]);

  return <>{currentText}</>;
};

export default Typewriter;