import { PrimeReactProvider } from 'primereact/api';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  return (
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  );
}

export default App;
