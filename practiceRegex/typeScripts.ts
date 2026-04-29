import express from 'express';
import { Request, Response } from 'express';
import Profile from '../hng_stage2/models/usermodel';
import AppError from '../hng_stage2/utils/appError';


const getProfiles = async (req: Request, res: Response, next) => {
  const profiles = await Profile.find();
  res.status(200).json({ status: 'success', data: profiles });
};
