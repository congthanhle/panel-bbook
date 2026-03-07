import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { theme } from '@/theme/theme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntdApp>
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
