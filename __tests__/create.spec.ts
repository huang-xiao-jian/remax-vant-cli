// internal
import { render, RenderType } from '../src/lib/create';

describe('create new component', () => {
  it('should render default export', () => {
    expect(render(RenderType.INDEX, 'Rate')).toMatchSnapshot();
  });

  it('should render page template', () => {
    expect(render(RenderType.PAGE, 'Rate')).toMatchSnapshot();
  });

  it('should render component template with default props', () => {
    expect(render(RenderType.COMPONENT, 'Rate')).toMatchSnapshot();
  });

  it('should render component template without default props', () => {
    expect(
      render(RenderType.COMPONENT, 'Rate', { withoutDefaultProps: true })
    ).toMatchSnapshot();
  });
});
