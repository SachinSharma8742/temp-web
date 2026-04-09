import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark' });

export function ThemeProvider({ children }) {
    const [theme] = useState('light');

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
