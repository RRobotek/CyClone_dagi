'use client';

import { extendTheme } from '@chakra-ui/react';

const colors = {
  gray: {
    900: '#121212',
    800: '#181818',
  },
  purple: {
    500: '#805AD5',
    600: '#6B46C1',
  },
};

const theme = extendTheme({
  colors,
  fonts: {
    body: `"Courier New", monospace`,
    heading: `"Courier New", monospace`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
      variants: {
        solid: {
          bg: 'purple.500',
          color: 'white',
          _hover: {
            bg: 'purple.600',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'gray.800',
        },
      },
    },
  },
});

export default theme;