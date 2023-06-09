import React, { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import uniqid from 'uniqid';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useFormik } from 'formik';
import * as yup from 'yup';

const defaultCols = { xs: 12, sm: 12, md: 12, lg: 12 };

export default function Form({
  children = null,
  name = 'form',
  onSubmit = () => {},
  submitButtonText = 'Submit',
}) {
  const childrenArray = Children.toArray(children);

  const initialValues = Object.fromEntries(
    childrenArray.map((child) =>
      child.props.name ? [child.props.name, child.props.value || ''] : [],
    ),
  );

  const validationSchema = yup
    .object()
    .shape(
      Object.fromEntries(
        childrenArray.map((child) =>
          child.props.isVisible !== false &&
          child.props.name &&
          child.props.validator
            ? [child.props.name, child.props.validator || '']
            : [],
        ),
      ),
    );

  const { errors, handleSubmit, handleChange, touched, values } = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    onSubmit: (formValues) => {
      onSubmit(formValues);
    },
  });

  return (
    <form aria-label={name} onSubmit={handleSubmit} noValidate>
      <Grid spacing={2} container>
        {Children.map(childrenArray, (child) => {
          const {
            cols = defaultCols,
            showIf = null,
            id = uniqid(),
            name,
            ...props
          } = child.props;

          const error = !!(errors[name] && touched[name]);

          let showField = true;

          if (showIf) {
            const [name, value] = showIf;
            showField = values[name] === value;
          }

          return showField ? (
            <Grid item {...cols} key={name}>
              {cloneElement(child, {
                id,
                name,
                value: values[name],
                onChange: handleChange,
                error,
                ...(!child?.props?.type?.match(/checkbox|radio/) && {
                  fullWidth: true,
                  helperText: errors[name],
                }),
                ...props,
              })}
            </Grid>
          ) : null;
        })}
        <Grid {...defaultCols} item>
          <Button size="large" variant="contained" type="submit" fullWidth>
            {submitButtonText}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

Form.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
  onSubmit: PropTypes.func,
  submitButtonText: PropTypes.string,
};

export const validate = yup;
