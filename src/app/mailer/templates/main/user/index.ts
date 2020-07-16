import * as config from '../../../../../../config';
import mail from '../../../../services/mail';
import { renderTemplate } from '../..';

export const sendVerificationEmail = async (user, url) => {
  console.log({ url, user });
  const template = await renderTemplate('user/verify-email', {
    url,
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: 'Please, verify your email',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendVerificationOtp = async (user, otp, isNew = true) => {
  const templatePath = isNew ? 'user/verification-otp' : 'user/resend-verification-otp';
  const template = await renderTemplate(templatePath, {
    otp,
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: isNew ? 'Welcome to Africa Travel Club' : 'Verification OTP',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendResetPasswordEmail = async (user, otp) => {
  const template = await renderTemplate('user/password-reset', {
    otp,
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: 'Reset password confirmation',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendLoginDeviceChanged = async (user, { device, city, country }) => {
  const template = await renderTemplate('user/new-login', {
    device,
    city,
    country,
    firstName: user.firstName,
    timestamp: new Date(),
  });

  const options = {
    html: template.html,
    subject: 'Login detected from a new Device',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendPasswordChanged = async (user) => {
  const template = await renderTemplate('user/password-changed', {
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: 'Your Africa Travel Club account password was successfully changed',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendEmailChanged = async (user) => {
  const template = await renderTemplate('user/email-changed', {
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: 'Your Africa Travel Club account email was successfully changed',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};

export const sendPhoneNumberChanged = async (user) => {
  const template = await renderTemplate('user/phone-changed', {
    firstName: user.firstName,
  });

  const options = {
    html: template.html,
    subject: 'Your Africa Travel Club account phone number was successfully changed',
    text: template.text,
    to: user.email,
  };

  return mail.send(options);
};
