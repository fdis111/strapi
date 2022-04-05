/* eslint-disable react/prop-types */

import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { Flex } from '@strapi/design-system/Flex';
import { Icon } from '@strapi/design-system/Icon';
import { Typography } from '@strapi/design-system/Typography';
import ChevronUp from '@strapi/icons/ChevronUp';
import ChevronDown from '@strapi/icons/ChevronDown';

import Select, { components } from '../ReactSelect';
import pxToRem from '../../utils/pxToRem';

const ToggleButton = styled.button`
  align-self: flex-end;
  margin-left: auto;
  padding: 0.25rem 0.75rem;
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
            <Typography variant="epsilon" textColor="neutral800">
              <span style={{ paddingLeft: `${data.depth * 10}px` }}>{children}</span>
            </Typography>

            {hasChildren && (
              <ToggleButton type="button" onClick={event => handleToggle(event, data)}>
                <Icon width={pxToRem(14)} color="neutral500" as={openValues.includes(data.value) ? ChevronUp : ChevronDown} />
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
