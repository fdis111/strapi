/* eslint-disable react/prop-types */

import React, { useEffect, useState, useMemo } from 'react';
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
  const flatDefaultOptions = useMemo(() => flattenTree(defaultOptions), [defaultOptions]);
  const toplevelDefaultOptions = useMemo(() => flatDefaultOptions.filter(hasParent), [
    flatDefaultOptions,
  ]);
  const [options, setOptions] = useState(toplevelDefaultOptions);
  const [openValues, setOpenValues] = useState([]);

  useEffect(() => {
    if (openValues.length === 0) {
      setOptions(toplevelDefaultOptions);
    }

    openValues.forEach(value => {
      const filtered = flatDefaultOptions.filter(
        option => hasParentOrMatchesValue(option, value) || hasParent(option)
      );

      setOptions(filtered);
    });
  }, [openValues, flatDefaultOptions, toplevelDefaultOptions]);

  function handleToggle(e, data) {
    e.preventDefault();
    e.stopPropagation();

    if (openValues.includes(data.value)) {
      setOpenValues(prev => prev.filter(prevData => prevData !== data.value));
    } else {
      setOpenValues(prev => [...prev, data.value]);
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
                {openValues.includes(data.value) ? <ChevronUp /> : <ChevronDown />}
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
