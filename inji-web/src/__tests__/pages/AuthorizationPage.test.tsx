import React from 'react';
import { AuthorizationPage } from '../../pages/AuthorizationPage';
import { mockUseTranslation,mockUseapiObject,renderWithRouter,mockWindowLocation} from '../../test-utils/mockUtils';

mockUseTranslation();
mockUseapiObject()
describe('Testing the Layouts of AuthorizationPage', () => {
  test('check if it renders properly if there is no error in URL', () => {
    mockWindowLocation('https://api.collab.mosip.net');
    const {asFragment} = renderWithRouter(<AuthorizationPage />);
    expect(asFragment()).toMatchSnapshot();

  });

  test('check if it shows error messages if error in URL', () => {
    mockWindowLocation('https://api.collab.mosip.net?error=some_error');
    const{asFragment} = renderWithRouter(<AuthorizationPage />);
    expect(asFragment()).toMatchSnapshot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});