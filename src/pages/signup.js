import React from "react";
import { Link, useHistory } from "react-router-dom";
import SEO from "../components/shared/Seo";
import { useSignUpPageStyles } from "../styles";
import { LoginWithFacebook } from "./login";
import { Button, Card, InputAdornment, TextField, Typography } from "@material-ui/core";
import { HighlightOff, CheckCircleOutline } from '@material-ui/icons';
import { AuthContext } from "../auth";
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';
import { useApolloClient } from "@apollo/react-hooks";
import { CHECK_IF_USERNAME_IS_TAKEN } from "../graphql/queries";


function SignUpPage() {
  const classes = useSignUpPageStyles();
  const { register, handleSubmit, formState, errors } = useForm({ mode: 'onBlur' });
  const { signUpWithEmailAndPassword } = React.useContext(AuthContext)

  // Not used with the implementation of `useForm` and validator's `isEmail`
  // const [values, setValues] = React.useState({
    //   email: '',
    //   name: '',
    //   username: '',
    //   password: ''
    // });
    
    const history = useHistory();
    const [error, setError] = React.useState('');
    const client = useApolloClient();
    
    // Not used with the implementation of `useForm` and validator's `isEmail`
    // function handleChange(e) {
      //   const { name, value } = e.target;
      //   setValues(prev => ({ ...prev, [name]: value }));
      // }
      
      // Not used with the implementation of `useForm` and validator's `isEmail`
  // async function handleSubmit(e) {
  //   e.preventDefault();
  //   await signUpWithEmailAndPassword(values);
  //   history.push('/');
  // }
  
  async function onSubmit(data) {
    try {
      setError('')
      await signUpWithEmailAndPassword(data);
      setTimeout(() => history.push("/"), 0);
    } catch (err) {
      setError(err.message);
      handleError(err);
    }
  }

  function handleError(error) {
    if (error.message.includes("users_username_key")){
      setError('Username already taken')
    } else if (error.code.includes('auth')) {
      setError(error.message);
    }
  }

  async function validateUsername(username) {
    const variables = { username }
    const response = await client.query({
      query: CHECK_IF_USERNAME_IS_TAKEN, 
      variables
    });
    const isUsernameValid = response.data.users.length === 0;
    return isUsernameValid;
  }

  const errorIcon = (
    <InputAdornment>
      <HighlightOff style={{ color: 'red', height: 30, width: 30 }} />
    </InputAdornment>
  )

  const validIcon = (
    <InputAdornment>
      <CheckCircleOutline style={{ color: '#ccc', height: 30, width: 30 }} />
    </InputAdornment>
  )

  return (
    <>
      <SEO title="Sign up" />
      <section className={classes.section}>
        <article>
          <Card className={classes.card}>
            <div className={classes.cardHeader} />
            <Typography className={classes.cardHeaderSubHeader}>
              Sign up to see photos and videos from your friends.
            </Typography>
            <LoginWithFacebook color="primary" iconColor="white" variant="contained" />
            <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant="body2" color="textSecondary" >
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                name="email"
                // onChange={handleChange}
                inputRef={register({
                  required: true,
                  validate: input => isEmail(input),
                })}
                InputProps={{
                  endAdornment: errors.email 
                    ? errorIcon 
                    : formState.touched.email && validIcon
                }}
                fullWidth
                variant="filled"
                label="Email"
                type="email"
                margin="dense"
                className={classes.textField} 
              />
              <TextField
                name="name"
                // onChange={handleChange}
                InputProps={{
                  endAdornment: errors.name 
                    ? errorIcon 
                    : formState.touched.name && validIcon
                }}
                inputRef={register({
                  required: true,
                  minLength: 5,
                  maxLength: 20
                })}
                fullWidth
                variant="filled"
                label="Full Name"
                margin="dense"
                className={classes.textField}
              />
              <TextField
                name="username"
                // onChange={handleChange}
                inputRef={register({
                  required: true,
                  minLength: 5,
                  maxLength: 20,
                  validate: async (input) => await validateUsername(input),
                  pattern: /^[a-zA-Z0-9_.]*$/
                })}
                InputProps={{
                  endAdornment: errors.username 
                    ? errorIcon 
                    : formState.touched.username && validIcon
                }}
                fullWidth
                variant="filled"
                label="Username"
                margin="dense"
                className={classes.textField}
                autoComplete="username"
              />
              <TextField
                name="password"
                // onChange={handleChange}   
                inputRef={register({
                  required: true,
                  minLength: 5
                })}    
                InputProps={{
                  endAdornment: errors.password 
                    ? errorIcon 
                    : formState.touched.password && validIcon
                }}       
                fullWidth
                variant="filled"
                label="Password"
                type="password"
                margin="dense"
                className={classes.textField}
                autoComplete="new-password"
              />
              <Button
                disabled={!formState.isValid || formState.isSubmitting }
                variant="contained"
                fullWidth 
                color="primary"
                className={classes.button}
                type="submit"
              >
                Sign Up
              </Button>
            </form>
            <AuthError error={error} />
            {/* <div className={classes.orContainer}>
              <div className={classes.orLine} />
              <div>
                <Typography variant="body2" color="textSecondary" >
                  OR
                </Typography>
              </div>
              <div className={classes.orLine} />
            </div> */}

          </Card>
          <Card className={classes.loginCard}>
            <Typography align="right" variant="body2">
              Have an account?
            </Typography>
            <Link to="/accounts/login">
              <Button color="primary" className={classes.loginButton}>
                Log in
              </Button>
            </Link>
          </Card>
        </article>
      </section>
    </>
  );
}

export function AuthError({ error }) {
  return Boolean(error) && (
    <Typography 
      align='center'
      gutterBottom
      variant='body2'
      style={{ color: 'red' }}
    >
      {error}
    </Typography>
  )
}
export default SignUpPage;
