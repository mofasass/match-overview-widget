/* eslint-env jest */
import React, { Children } from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import ArrowButton from '../../src/js/Components/ArrowButton';

let renderer;

describe('ArrowButton DOM rendering', () => {
   beforeEach(() => {
      renderer = ReactTestUtils.createRenderer();
   });

   it('renders correctly left variant', () => {
      expect(renderer.render(
         <ArrowButton type="left" onClick={() => {}} />
      )).toMatchSnapshot();
   });

   it('renders correctly right variant', () => {
      expect(renderer.render(
         <ArrowButton type="right" onClick={() => {}} />
      )).toMatchSnapshot();
   });

   it('renders correctly when disabled', () => {
      expect(renderer.render(
         <ArrowButton type="right" onClick={() => {}} disabled={true} />
      )).toMatchSnapshot();
   });

});

describe('ArrowButton behaviour', () => {

   it('handles clicks correctly', () => {
      const onClickMock = jest.fn();

      const wrapper = shallow(
         <ArrowButton type="left" onClick={onClickMock} />
      );

      expect(onClickMock).not.toHaveBeenCalled();

      wrapper.find('button').simulate('click');

      expect(onClickMock).toHaveBeenCalledTimes(1);
   });

});
