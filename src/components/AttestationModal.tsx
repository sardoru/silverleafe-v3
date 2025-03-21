import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileCheck } from 'lucide-react';

export interface AttestationData {
  attestationType: string;
  description: string;
  documents: FileList;
  date: string;
  location: string;
  verifier: string;
}

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttestationData) => void;
  stageId: string;
}

const AttestationModal: React.FC<AttestationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stageId
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AttestationData>();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add Attestation
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Attestation Type
                  </label>
                  <select
                    {...register('attestationType', { required: true })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="quality">Quality Check</option>
                    <option value="processing">Processing Step</option>
                    <option value="transfer">Transfer</option>
                    <option value="certification">Certification</option>
                  </select>
                  {errors.attestationType && (
                    <p className="mt-1 text-sm text-red-600">This field is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: true })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">This field is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supporting Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            {...register('documents')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">This field is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location', { required: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">This field is required</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verifier
                  </label>
                  <input
                    type="text"
                    {...register('verifier', { required: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.verifier && (
                    <p className="mt-1 text-sm text-red-600">This field is required</p>
                  )}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Submit Attestation
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttestationModal;