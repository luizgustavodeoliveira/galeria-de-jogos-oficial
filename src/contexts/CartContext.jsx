import React, { createContext, useState, useCallback, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('carrinho');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(cartItems));
  }, [cartItems]);

  const adicionarAoCarrinho = useCallback((jogo) => {
    setCartItems(prev => {
      const itemExistente = prev.find(item => item.jogo.id === jogo.id);
      if (itemExistente) {
        return prev.map(item => 
          item.jogo.id === jogo.id 
            ? { ...item, quantidade: item.quantidade + 1 } 
            : item
        );
      }
      return [...prev, { jogo, quantidade: 1 }];
    });
  }, []);

  const removerDoCarrinho = useCallback((jogoId) => {
    setCartItems(prev => prev.filter(item => item.jogo.id !== jogoId));
  }, []);

  const atualizarQuantidade = useCallback((jogoId, quantidade) => {
    if (quantidade < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.jogo.id === jogoId 
          ? { ...item, quantidade } 
          : item
      )
    );
  }, []);

  const limparCarrinho = useCallback(() => {
    setCartItems([]);
  }, []);

  const quantidadeTotal = cartItems.reduce((acc, item) => acc + item.quantidade, 0);

  const valorTotal = cartItems.reduce((acc, item) => {
    const preco = item.jogo.preco || 0;
    return acc + (preco * item.quantidade);
  }, 0);

  const value = {
    cartItems,
    quantidadeTotal,
    valorTotal,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidade,
    limparCarrinho
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
}
