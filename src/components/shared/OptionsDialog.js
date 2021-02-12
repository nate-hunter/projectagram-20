import React from "react";
import { Dialog, Typography, Zoom, Button, Divider } from "@material-ui/core";
import { useOptionsDialogStyles } from "../../styles";
import { Link, useHistory } from "react-router-dom";
import { UserContext } from '../../App';
import { useMutation } from "@apollo/react-hooks";
import { DELETE_POST, UNFOLLOW_USER } from "../../graphql/mutations";


function OptionsDialog({ onClose, postId, authorId }) {
  const classes = useOptionsDialogStyles();
  const { currentUserId, followingIds } = React.useContext(UserContext);
  const isOwner = authorId === currentUserId;
  const buttonText = isOwner ? 'Delete' : 'Unfollow';
  const onClick = isOwner ? handleDeletePost : handleUnfollowUser;
  const isFollowing = followingIds.some(id => id === authorId);
  const isUnrelatedUser = !isOwner && !isFollowing;
  const [unfollowUser] = useMutation(UNFOLLOW_USER);
  const [deletePost] = useMutation(DELETE_POST);
  const history = useHistory();
  
  function handleDeletePost() {
    const variables = {
      postId,
      userId: currentUserId
    }
    deletePost({ variables });
    onClose();
    history.push('/');
    window.location.reload();
  }

  function handleUnfollowUser() {
    const variables = {
      userIdToFollow: authorId,
      currentUserId
    }
    unfollowUser({ variables });
    onClose();
  }

  return (
    <Dialog
      open
      classes={{
        scrollPaper: classes.dialogScrollPaper
      }}
      onClose={onClose}
      TransitionComponent={Zoom}
    >
      {!isUnrelatedUser && 
        <Button onClick={onClick} className={classes.redButton}>
          {buttonText}
        </Button>
      }
      <Divider />
      <Button className={classes.button}>
        <Link to={`/p/${postId}`}>
          Go to post
        </Link>
      </Button>      
      <Divider />
      <Button className={classes.button}>
        Share
      </Button>
      <Divider />
      <Button className={classes.button}>
        Copy Link
      </Button>
      <Divider />
      <Button onClick={onClose} className={classes.button}>
        Cancel
      </Button>
    </Dialog>
  );
}

export default OptionsDialog;
