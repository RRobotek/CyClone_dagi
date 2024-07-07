import '../styles/global.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './utils/providers';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './utils/theme';

export const metadata = {
  title: 'Cyclone',
  description: 'Cyclone',
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider theme={theme}>
          <Providers>{children}</Providers>
        </ChakraProvider>
      </body>
    </html>
  );
}

export default RootLayout;
