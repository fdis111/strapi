/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { Flex } from '@strapi/design-system/Flex';
import ChevronUp from '@strapi/icons/ChevronUp';
import ChevronDown from '@strapi/icons/ChevronDown';

const ToggleButton = styled.button`
  align-self: flex-end;
  margin-left: auto;
`;

const flattenTree = (tree, parent, depth = 1) =>
  tree.flatMap(item =>
    item.children
      ? [{ ...item, parent: parent?.value, depth }, ...flattenTree(item.children, item, depth + 1)]
      : { ...item, depth, parent: parent?.value }
  );

const hasParent = option => !option.parent;

const hasParentOrMatchesValue = (option, value) =>
  option.value === value || option.parent === value;

const SelectTree = ({ options: defaultOptions, ...props }) => {
  const flatDefaultOptions = flattenTree(defaultOptions);
  const [open, setOpen] = useState([]);
  const [options, setOptions] = useState(flatDefaultOptions.filter(hasParent));

  useEffect(() => {
    open.forEach(data => {
      const flatOptions = flattenTree(defaultOptions);
      const filtered = flatOptions.filter(
        option => hasParentOrMatchesValue(option, data.value) || hasParent(option)
      );

      setOptions(filtered);
    });
  }, [open, defaultOptions]);

  function handleToggle(e, data) {
    e.preventDefault();
    e.stopPropagation();

    if (data?.isOpen) {
      setOpen(prev => prev.filter(prevData => prevData.value !== data.value));
    } else {
      setOpen(prev => [...prev, data]);
    }
  }

  const CustomOption = ({ children, data, ...props }) => {
    const hasChildren = data?.children?.length > 0;

    return (
      <>
        <components.Option {...props}>
          <Flex alignItems="start">
            <span style={{ paddingLeft: `${data.depth * 10}px` }}>{children}</span>

            {hasChildren && (
              <ToggleButton type="button" onClick={event => handleToggle(event, data)}>
                {data?.isOpen ? <ChevronUp /> : <ChevronDown />}
              </ToggleButton>
            )}
          </Flex>
        </components.Option>
      </>
    );
  };

  return <Select components={{ Option: CustomOption }} options={options} {...props} />;
};

SelectTree.propTypes = {
  options: PropTypes.object.isRequired,
};

export default SelectTree;
