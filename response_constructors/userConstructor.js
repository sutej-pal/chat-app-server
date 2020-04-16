const storage = require('../config/storage')

module.exports = class UserConstructor {
    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
        this.profileImage = user.profileImage || storage.defaultUserProfileImage;
        this.coverImage = user.coverImage || storage.defaultUserCoverImage;
        this.bio = user.bio;
        this.isActive = user.isActive;
        this.lastContacted = user.lastContacted;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
