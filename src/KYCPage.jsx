import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of Birth must be in YYYY-MM-DD format'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'Zip/Postal Code is required'),
  country: z.string().min(1, 'Country is required'),
});

const fileUploadSchema = z.object({
  idSelfie: z.any().refine(file => file?.length > 0, 'ID Selfie is required.'),
  proofOfAddress: z.any().refine(file => file?.length > 0, 'Proof of Address is required.'),
});

const KYCPage = () => {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const [step, setStep] = useState(1);
  const [kycStatus, setKycStatus] = useState(user?.kyc?.status || 'not_submitted');
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      dob: user?.kyc?.dob || '',
      address: user?.kyc?.address?.address || '',
      city: user?.kyc?.address?.city || '',
      state: user?.kyc?.address?.state || '',
      zipCode: user?.kyc?.address?.zipCode || '',
      country: user?.kyc?.address?.country || '',
    },
  });

  const { register: registerStep2, handleSubmit: handleSubmitStep2, formState: { errors: errorsStep2 } } = useForm({
    resolver: zodResolver(fileUploadSchema),
  });

  useEffect(() => {
    if (user?.kyc?.status) {
      setKycStatus(user.kyc.status);
    }
  }, [user]);

  const onPersonalInfoSubmit = (data) => {
    console.log('Personal Info:', data);
    setStep(2);
  };

  const onFileUploadSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      const formData = new FormData();
      formData.append('idSelfie', data.idSelfie[0]);
      formData.append('proofOfAddress', data.proofOfAddress[0]);

      const response = await userAPI.submitKYCDocuments(formData);
      setSubmissionSuccess(response.message || 'KYC documents submitted successfully for review!');
      setKycStatus('pending');
      checkAuthStatus(); // Refresh user data
    } catch (error) {
      setSubmissionError(error.message || 'Failed to submit KYC documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>

      {kycStatus === 'pending' && (
        <Alert className="mb-4">
          <AlertTitle>KYC Pending Review</AlertTitle>
          <AlertDescription>Your KYC application is currently under review. We will notify you once it has been processed.</AlertDescription>
        </Alert>
      )}

      {kycStatus === 'approved' && (
        <Alert className="mb-4 bg-green-100 border-green-500 text-green-700">
          <AlertTitle>KYC Approved!</AlertTitle>
          <AlertDescription>Your KYC application has been approved. You now have full access to all platform features.</AlertDescription>
        </Alert>
      )}

      {kycStatus === 'rejected' && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>KYC Rejected</AlertTitle>
          <AlertDescription>
            Your previous KYC application was rejected. Please review the requirements and resubmit.
            {user?.kyc?.rejectionReason && <p className="mt-2">Reason: {user.kyc.rejectionReason}</p>}
          </AlertDescription>
        </Alert>
      )}

      {submissionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Submission Error</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      {submissionSuccess && (
        <Alert className="mb-4 bg-green-100 border-green-500 text-green-700">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{submissionSuccess}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Step {step}: {step === 1 ? 'Personal Information' : 'Document Upload'}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmitStep1(onPersonalInfoSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...registerStep1('firstName')} />
                  {errorsStep1.firstName && <p className="text-red-500 text-sm mt-1">{errorsStep1.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...registerStep1('lastName')} />
                  {errorsStep1.lastName && <p className="text-red-500 text-sm mt-1">{errorsStep1.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth (YYYY-MM-DD)</Label>
                <Input id="dob" type="date" {...registerStep1('dob')} />
                {errorsStep1.dob && <p className="text-red-500 text-sm mt-1">{errorsStep1.dob.message}</p>}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...registerStep1('address')} />
                {errorsStep1.address && <p className="text-red-500 text-sm mt-1">{errorsStep1.address.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...registerStep1('city')} />
                  {errorsStep1.city && <p className="text-red-500 text-sm mt-1">{errorsStep1.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" {...registerStep1('state')} />
                  {errorsStep1.state && <p className="text-red-500 text-sm mt-1">{errorsStep1.state.message}</p>}
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input id="zipCode" {...registerStep1('zipCode')} />
                  {errorsStep1.zipCode && <p className="text-red-500 text-sm mt-1">{errorsStep1.zipCode.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...registerStep1('country')} />
                {errorsStep1.country && <p className="text-red-500 text-sm mt-1">{errorsStep1.country.message}</p>}
              </div>
              <Button type="submit">Next Step</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmitStep2(onFileUploadSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="idSelfie">Upload ID Selfie</Label>
                <Input id="idSelfie" type="file" accept="image/*" {...registerStep2('idSelfie')} />
                {errorsStep2.idSelfie && <p className="text-red-500 text-sm mt-1">{errorsStep2.idSelfie.message}</p>}
              </div>
              <div>
                <Label htmlFor="proofOfAddress">Upload Proof of Address</Label>
                <Input id="proofOfAddress" type="file" accept="image/*,application/pdf" {...registerStep2('proofOfAddress')} />
                {errorsStep2.proofOfAddress && <p className="text-red-500 text-sm mt-1">{errorsStep2.proofOfAddress.message}</p>}
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Previous Step</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit KYC
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCPage;


