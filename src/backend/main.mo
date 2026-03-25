import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Notification = {
    id : Text;
    userId : Text;
    title : Text;
    message : Text;
    notificationType : Text;
    isRead : Bool;
    createdAt : Int;
    relatedId : Text;
  };

  public type User = {
    id : Text;
    username : Text;
    email : Text;
    bio : Text;
    avatarUrl : Text;
    role : Text;
    createdAt : Int;
    offeredSkills : [Text];
    wantedSkills : [Text];
  };

  public type Exchange = {
    id : Text;
    requesterId : Text;
    requesterName : Text;
    providerId : Text;
    providerName : Text;
    skillId : Text;
    skillTitle : Text;
    message : Text;
    status : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Skill = {
    id : Text;
    title : Text;
    description : Text;
    category : Text;
    offeredSkill : Text;
    wantedSkill : Text;
    authorId : Text;
    authorName : Text;
    createdAt : Int;
    status : Text;
    tags : [Text];
  };

  public type UserProfile = {
    username : Text;
    email : Text;
    bio : Text;
    avatarUrl : Text;
    offeredSkills : [Text];
    wantedSkills : [Text];
  };

  func compareUser(u1 : User, u2 : User) : Order.Order {
    Text.compare(u1.id, u2.id);
  };

  func compareSkill(s1 : Skill, s2 : Skill) : Order.Order {
    Text.compare(s1.id, s2.id);
  };

  func compareExchange(e1 : Exchange, e2 : Exchange) : Order.Order {
    Text.compare(e1.id, e2.id);
  };

  func compareNotification(n1 : Notification, n2 : Notification) : Order.Order {
    Text.compare(n1.id, n2.id);
  };

  public type UserProfileUpdate = {
    bio : ?Text;
    avatarUrl : ?Text;
    offeredSkills : ?[Text];
    wantedSkills : ?[Text];
  };

  public type SkillUpdate = {
    title : ?Text;
    description : ?Text;
    category : ?Text;
    offeredSkill : ?Text;
    wantedSkill : ?Text;
    tags : ?[Text];
  };

  public type ExchangeUpdate = {
    status : ?Text;
    message : ?Text;
  };

  var nextId = 0;
  func generateId() : Text {
    let id = nextId;
    nextId += 1;
    id.toText();
  };

  let notificationStore = Map.empty<Text, Notification>();
  let skillStore = Map.empty<Text, Skill>();
  let userStore = Map.empty<Text, User>();
  let exchangeStore = Map.empty<Text, Exchange>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToUserId = Map.empty<Principal, Text>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser(username : Text, email : Text, bio : Text) : async User {
    let userId = generateId();
    let user : User = {
      id = userId;
      username;
      email;
      bio;
      avatarUrl = "";
      role = "user";
      createdAt = Time.now();
      offeredSkills = [];
      wantedSkills = [];
    };
    userStore.add(userId, user);
    principalToUserId.add(caller, userId);
    if (not caller.isAnonymous()) {
      accessControlState.userRoles.add(caller, #user);
    };
    user;
  };

  public query ({ caller = _ }) func getUserById(id : Text) : async ?User {
    userStore.get(id);
  };

  public query ({ caller = _ }) func getUserByPrincipal(principal : Principal) : async ?User {
    switch (principalToUserId.get(principal)) {
      case (null) { null };
      case (?userId) { userStore.get(userId) };
    };
  };

  public shared ({ caller = _ }) func updateProfile(id : Text, bio : Text, offeredSkills : [Text], wantedSkills : [Text]) : async ?User {
    switch (userStore.get(id)) {
      case (null) { null };
      case (?user) {
        let updatedUser : User = {
          id = user.id;
          username = user.username;
          email = user.email;
          bio;
          avatarUrl = user.avatarUrl;
          role = user.role;
          createdAt = user.createdAt;
          offeredSkills;
          wantedSkills;
        };
        userStore.add(id, updatedUser);
        ?updatedUser;
      };
    };
  };

  public shared ({ caller = _ }) func listUsers() : async [User] {
    userStore.values().toArray().sort(compareUser);
  };

  public shared ({ caller }) func deleteUser(id : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    let existed = userStore.containsKey(id);
    userStore.remove(id);
    existed;
  };

  func promoteToAdminInternal(id : Text) : Bool {
    switch (userStore.get(id)) {
      case (null) { false };
      case (?user) {
        let updatedUser : User = {
          id = user.id;
          username = user.username;
          email = user.email;
          bio = user.bio;
          avatarUrl = user.avatarUrl;
          role = "admin";
          createdAt = user.createdAt;
          offeredSkills = user.offeredSkills;
          wantedSkills = user.wantedSkills;
        };
        userStore.add(id, updatedUser);
        true;
      };
    };
  };

  public shared ({ caller }) func promoteToAdmin(id : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can promote to admin");
    };
    promoteToAdminInternal(id);
  };

  public shared ({ caller }) func isAdmin(principal : Principal) : async Bool {
    AccessControl.isAdmin(accessControlState, principal);
  };

  public shared ({ caller = _ }) func createSkill(title : Text, description : Text, category : Text, offeredSkill : Text, wantedSkill : Text, authorId : Text, authorName : Text, tags : [Text]) : async Skill {
    let skillId = generateId();
    let skill : Skill = {
      id = skillId;
      title;
      description;
      category;
      offeredSkill;
      wantedSkill;
      authorId;
      authorName;
      createdAt = Time.now();
      status = "active";
      tags;
    };
    skillStore.add(skillId, skill);
    skill;
  };

  public query ({ caller = _ }) func getSkillById(id : Text) : async ?Skill {
    skillStore.get(id);
  };

  public query ({ caller = _ }) func listSkills() : async [Skill] {
    skillStore.values().toArray().sort(compareSkill);
  };

  public query ({ caller = _ }) func listByCategory(category : Text) : async [Skill] {
    let all = skillStore.values().toArray().sort(compareSkill);
    all.filter(func(s : Skill) : Bool { s.category == category });
  };

  public shared ({ caller = _ }) func updateSkill(id : Text, title : Text, description : Text, tags : [Text]) : async ?Skill {
    switch (skillStore.get(id)) {
      case (null) { null };
      case (?skill) {
        let updatedSkill : Skill = {
          id = skill.id;
          title;
          description;
          category = skill.category;
          offeredSkill = skill.offeredSkill;
          wantedSkill = skill.wantedSkill;
          authorId = skill.authorId;
          authorName = skill.authorName;
          createdAt = skill.createdAt;
          status = skill.status;
          tags;
        };
        skillStore.add(id, updatedSkill);
        ?updatedSkill;
      };
    };
  };

  public shared ({ caller }) func deleteSkill(id : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete skills");
    };
    let existed = skillStore.containsKey(id);
    skillStore.remove(id);
    existed;
  };

  public shared ({ caller = _ }) func setStatus(id : Text, status : Text) : async Bool {
    switch (skillStore.get(id)) {
      case (null) { false };
      case (?skill) {
        let updatedSkill : Skill = {
          id = skill.id;
          title = skill.title;
          description = skill.description;
          category = skill.category;
          offeredSkill = skill.offeredSkill;
          wantedSkill = skill.wantedSkill;
          authorId = skill.authorId;
          authorName = skill.authorName;
          createdAt = skill.createdAt;
          status;
          tags = skill.tags;
        };
        skillStore.add(id, updatedSkill);
        true;
      };
    };
  };

  public type SortOrder = {
    #asc;
    #desc;
  };

  public query ({ caller = _ }) func searchSkills(searchTerm : Text, sortOrder : SortOrder) : async [Skill] {
    let all = skillStore.values().toArray().sort(compareSkill);
    let filtered = all.filter(
      func(skill : Skill) : Bool {
        skill.title.contains(#text searchTerm) or skill.description.contains(#text searchTerm);
      }
    );
    switch (sortOrder) {
      case (#asc) { filtered };
      case (#desc) { filtered.reverse() };
    };
  };

  public shared ({ caller = _ }) func sendRequest(requesterId : Text, requesterName : Text, providerId : Text, providerName : Text, skillId : Text, skillTitle : Text, message : Text) : async Exchange {
    let exchangeId = generateId();
    let exchange : Exchange = {
      id = exchangeId;
      requesterId;
      requesterName;
      providerId;
      providerName;
      skillId;
      skillTitle;
      message;
      status = "pending";
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    exchangeStore.add(exchangeId, exchange);
    ignore createNotificationInternal(providerId, "New Exchange Request", requesterName # " sent you a request for " # skillTitle, "exchange_request", exchangeId);
    exchange;
  };

  public query ({ caller = _ }) func getExchangeById(id : Text) : async ?Exchange {
    exchangeStore.get(id);
  };

  public query ({ caller = _ }) func listByUser(userId : Text) : async [Exchange] {
    let all = exchangeStore.values().toArray().sort(compareExchange);
    all.filter(func(e : Exchange) : Bool { e.requesterId == userId or e.providerId == userId });
  };

  public shared ({ caller = _ }) func acceptRequest(id : Text) : async ?Exchange {
    switch (exchangeStore.get(id)) {
      case (null) { null };
      case (?exchange) {
        let updatedExchange : Exchange = {
          id = exchange.id;
          requesterId = exchange.requesterId;
          requesterName = exchange.requesterName;
          providerId = exchange.providerId;
          providerName = exchange.providerName;
          skillId = exchange.skillId;
          skillTitle = exchange.skillTitle;
          message = exchange.message;
          status = "accepted";
          createdAt = exchange.createdAt;
          updatedAt = Time.now();
        };
        exchangeStore.add(id, updatedExchange);
        ignore createNotificationInternal(exchange.requesterId, "Exchange Accepted", exchange.providerName # " accepted your request for " # exchange.skillTitle, "exchange_accepted", id);
        ?updatedExchange;
      };
    };
  };

  public shared ({ caller = _ }) func declineRequest(id : Text) : async ?Exchange {
    switch (exchangeStore.get(id)) {
      case (null) { null };
      case (?exchange) {
        let updatedExchange : Exchange = {
          id = exchange.id;
          requesterId = exchange.requesterId;
          requesterName = exchange.requesterName;
          providerId = exchange.providerId;
          providerName = exchange.providerName;
          skillId = exchange.skillId;
          skillTitle = exchange.skillTitle;
          message = exchange.message;
          status = "declined";
          createdAt = exchange.createdAt;
          updatedAt = Time.now();
        };
        exchangeStore.add(id, updatedExchange);
        ignore createNotificationInternal(exchange.requesterId, "Exchange Declined", exchange.providerName # " declined your request for " # exchange.skillTitle, "exchange_declined", id);
        ?updatedExchange;
      };
    };
  };

  public shared ({ caller = _ }) func listAll() : async [Exchange] {
    exchangeStore.values().toArray().sort(compareExchange);
  };

  func createNotificationInternal(userId : Text, title : Text, message : Text, notificationType : Text, relatedId : Text) : Notification {
    let notificationId = generateId();
    let notification : Notification = {
      id = notificationId;
      userId;
      title;
      message;
      notificationType;
      isRead = false;
      createdAt = Time.now();
      relatedId;
    };
    notificationStore.add(notificationId, notification);
    notification;
  };

  public shared ({ caller = _ }) func createNotification(userId : Text, title : Text, message : Text, notificationType : Text, relatedId : Text) : async Notification {
    createNotificationInternal(userId, title, message, notificationType, relatedId);
  };

  public query ({ caller = _ }) func getNotifications(userId : Text) : async [Notification] {
    let all = notificationStore.values().toArray().sort(compareNotification);
    all.filter(func(n : Notification) : Bool { n.userId == userId });
  };

  public shared ({ caller = _ }) func markRead(id : Text) : async Bool {
    switch (notificationStore.get(id)) {
      case (null) { false };
      case (?notification) {
        let updated : Notification = {
          id = notification.id;
          userId = notification.userId;
          title = notification.title;
          message = notification.message;
          notificationType = notification.notificationType;
          isRead = true;
          createdAt = notification.createdAt;
          relatedId = notification.relatedId;
        };
        notificationStore.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller = _ }) func markAllRead(userId : Text) : async Nat {
    var count = 0;
    for ((id, notification) in notificationStore.entries()) {
      if (notification.userId == userId and not notification.isRead) {
        let updated : Notification = {
          id = notification.id;
          userId = notification.userId;
          title = notification.title;
          message = notification.message;
          notificationType = notification.notificationType;
          isRead = true;
          createdAt = notification.createdAt;
          relatedId = notification.relatedId;
        };
        notificationStore.add(id, updated);
        count += 1;
      };
    };
    count;
  };

  public query ({ caller = _ }) func getUnreadCount(userId : Text) : async Nat {
    var count = 0;
    for (notification in notificationStore.values()) {
      if (notification.userId == userId and not notification.isRead) {
        count += 1;
      };
    };
    count;
  };

  public shared ({ caller = _ }) func deleteNotification(id : Text) : async Bool {
    let existed = notificationStore.containsKey(id);
    notificationStore.remove(id);
    existed;
  };

  public type PopulateSampleDataResult = {
    sampleUsers : [User];
    sampleSkills : [Skill];
    sampleExchanges : [Exchange];
    sampleNotifications : [Notification];
  };

  func populateSampleDataInternal() : PopulateSampleDataResult {
    if (userStore.size() > 0 or skillStore.size() > 0) { Runtime.trap("Sample data already exists") };

    let users = [
      {
        id = generateId();
        username = "Alice";
        email = "alice@example.com";
        bio = "Web Dev teacher, wants Design";
        avatarUrl = "";
        role = "user";
        createdAt = Time.now();
        offeredSkills = ["JavaScript", "Web Development"];
        wantedSkills = ["Design"];
      },
      {
        id = generateId();
        username = "Bob";
        email = "bob@example.com";
        bio = "Guitar teacher, wants Cooking";
        avatarUrl = "";
        role = "user";
        createdAt = Time.now();
        offeredSkills = ["Guitar"];
        wantedSkills = ["Cooking"];
      },
      {
        id = generateId();
        username = "Carol";
        email = "carol@example.com";
        bio = "Yoga teacher, wants Spanish";
        avatarUrl = "";
        role = "user";
        createdAt = Time.now();
        offeredSkills = ["Yoga"];
        wantedSkills = ["Spanish"];
      },
      {
        id = generateId();
        username = "David";
        email = "david@example.com";
        bio = "Photography teacher, wants Web Dev";
        avatarUrl = "";
        role = "admin";
        createdAt = Time.now();
        offeredSkills = ["Photography"];
        wantedSkills = ["Web Development"];
      },
      {
        id = generateId();
        username = "Emma";
        email = "emma@example.com";
        bio = "Spanish teacher, wants Guitar";
        avatarUrl = "";
        role = "user";
        createdAt = Time.now();
        offeredSkills = ["Spanish"];
        wantedSkills = ["Guitar"];
      },
    ];

    for (user in users.values()) {
      userStore.add(user.id, user);
    };

    let skills = [
      {
        id = generateId();
        title = "JavaScript Tutoring";
        description = "Learn JavaScript from scratch";
        category = "Programming";
        offeredSkill = "JavaScript";
        wantedSkill = "Design";
        authorId = users[0].id;
        authorName = users[0].username;
        createdAt = Time.now();
        status = "active";
        tags = ["JavaScript", "Programming"];
      },
      {
        id = generateId();
        title = "Guitar Lessons";
        description = "Beginner guitar lessons";
        category = "Music";
        offeredSkill = "Guitar";
        wantedSkill = "Cooking";
        authorId = users[1].id;
        authorName = users[1].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Guitar", "Music"];
      },
      {
        id = generateId();
        title = "Yoga for Beginners";
        description = "Yoga classes for all levels";
        category = "Wellness";
        offeredSkill = "Yoga";
        wantedSkill = "Spanish";
        authorId = users[2].id;
        authorName = users[2].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Yoga", "Wellness"];
      },
      {
        id = generateId();
        title = "Spanish Conversation";
        description = "Practice Spanish speaking skills";
        category = "Language";
        offeredSkill = "Spanish";
        wantedSkill = "Guitar";
        authorId = users[4].id;
        authorName = users[4].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Spanish", "Language"];
      },
      {
        id = generateId();
        title = "Photography Basics";
        description = "Learn photography techniques";
        category = "Arts";
        offeredSkill = "Photography";
        wantedSkill = "Web Development";
        authorId = users[3].id;
        authorName = users[3].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Photography", "Arts"];
      },
      {
        id = generateId();
        title = "React & TypeScript";
        description = "Modern web development skills";
        category = "Programming";
        offeredSkill = "React";
        wantedSkill = "Design";
        authorId = users[0].id;
        authorName = users[0].username;
        createdAt = Time.now();
        status = "active";
        tags = ["React", "TypeScript", "Programming"];
      },
      {
        id = generateId();
        title = "Italian Cooking";
        description = "Learn authentic Italian recipes";
        category = "Culinary";
        offeredSkill = "Cooking";
        wantedSkill = "Yoga";
        authorId = users[1].id;
        authorName = users[1].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Cooking", "Culinary"];
      },
      {
        id = generateId();
        title = "UI/UX Design Fundamentals";
        description = "Master design principles";
        category = "Design";
        offeredSkill = "Design";
        wantedSkill = "Programming";
        authorId = users[3].id;
        authorName = users[3].username;
        createdAt = Time.now();
        status = "active";
        tags = ["Design", "UI/UX"];
      },
    ];

    for (skill in skills.values()) {
      skillStore.add(skill.id, skill);
    };

    let exchanges = [
      {
        id = generateId();
        requesterId = users[0].id;
        requesterName = users[0].username;
        providerId = users[1].id;
        providerName = users[1].username;
        skillId = skills[1].id;
        skillTitle = skills[1].title;
        message = "Interested in guitar lessons";
        status = "pending";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = generateId();
        requesterId = users[1].id;
        requesterName = users[1].username;
        providerId = users[2].id;
        providerName = users[2].username;
        skillId = skills[2].id;
        skillTitle = skills[2].title;
        message = "Would like to try yoga";
        status = "accepted";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = generateId();
        requesterId = users[2].id;
        requesterName = users[2].username;
        providerId = users[4].id;
        providerName = users[4].username;
        skillId = skills[3].id;
        skillTitle = skills[3].title;
        message = "Interested in spanish conversation";
        status = "declined";
        createdAt = Time.now();
        updatedAt = Time.now();
      },
    ];

    for (exchange in exchanges.values()) {
      exchangeStore.add(exchange.id, exchange);
    };

    let notifications = [
      {
        id = generateId();
        userId = users[1].id;
        title = "New Exchange Request";
        message = "Alice sent you a request for guitar lessons";
        notificationType = "exchange_request";
        isRead = false;
        createdAt = Time.now();
        relatedId = exchanges[0].id;
      },
      {
        id = generateId();
        userId = users[0].id;
        title = "Exchange Accepted";
        message = "Bob accepted your guitar lesson request";
        notificationType = "exchange_accepted";
        isRead = false;
        createdAt = Time.now();
        relatedId = exchanges[1].id;
      },
      {
        id = generateId();
        userId = users[2].id;
        title = "Exchange Declined";
        message = "Emma declined your spanish conversation request";
        notificationType = "exchange_declined";
        isRead = false;
        createdAt = Time.now();
        relatedId = exchanges[2].id;
      },
    ];

    for (notification in notifications.values()) {
      notificationStore.add(notification.id, notification);
    };

    {
      sampleExchanges = exchanges;
      sampleNotifications = notifications;
      sampleUsers = users;
      sampleSkills = skills;
    };
  };

  public shared ({ caller = _ }) func populateSampleData() : async PopulateSampleDataResult {
    populateSampleDataInternal();
  };

  let _seedData = populateSampleDataInternal();
};
