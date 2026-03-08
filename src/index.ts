/**
 * AWS SDK Extension - provides simplified interfaces for Amazon Rekognition and SES.
 * @module aws-sdk-extension
 */

// Client classes.
export {default as RekognitionClient} from '~/RekognitionClient';
export {default as SESClient} from '~/SESClient';

// Exception classes.
export {default as RekognitionCollectionCreateException} from '~/exceptions/RekognitionCollectionCreateException';
export {default as RekognitionCollectionDeleteException} from '~/exceptions/RekognitionCollectionDeleteException';
export {default as FaceIndexException} from '~/exceptions/FaceIndexException';
export {default as FaceMissingException} from '~/exceptions/FaceMissingException';
export {default as MultipleFacesException} from '~/exceptions/MultipleFacesException';
