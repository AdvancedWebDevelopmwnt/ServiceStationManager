import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Webcam from 'react-webcam';
import Iconify from 'src/components/iconify';

export default function ImageCaptureModal({ isOpen, onClose, onSave, imgType }) {
  const [img, setImg] = React.useState(null);
  const webcamRef = React.useRef(null);

  const videoConstraints = {
    width: { min: 480 },
    height: { min: 720 },
    // facingMode: { exact: "environment" },
  };

  const webcamStyle = {
    width: '100%',
    height: 'auto',
    maxWidth: '100%',
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
    onSave(imageSrc, imgType);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Image Capturing</DialogTitle>
      <DialogContent>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={webcamStyle}
          videoConstraints={videoConstraints}
          imageSmoothing={true}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="outlined"
          color="success"
          onClick={capture}
          autoFocus
          endIcon={<Iconify icon="bi:camera-fill" />}
        >
          Capture
        </Button>
      </DialogActions>
    </Dialog>
  );
}
