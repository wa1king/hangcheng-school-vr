"""Place small groups and foot routes around the school day landmarks."""

import math


def build_campus_people(world):
    people = []
    site_yaw = math.atan2(world(0, 0, 1)[0], world(0, 0, 1)[2])

    def actor(role, height, y, path, facing=None):
        data = {'role': role, 'height': height, 'points': [world(x, y, z) for x, z in path]}
        if facing is not None:
            data['facing'] = round(math.radians(facing) + site_yaw, 4)
        people.append(data)

    # Gate staff stay by their posts. Families use the paving behind the gate.
    actor('guard', 1.76, .007, [(4.6, 61.5)], 29)
    actor('guard', 1.72, .007, [(17.2, 61.5)], -31)
    actor('volunteer', 1.66, .007, [(3.8, 88.25)], -40)
    actor('volunteer', 1.71, .007, [(28.1, 88.45)], -145)
    actor('adult', 1.68, .007, [(7.4, 71.7), (7.4, 59.8)])
    actor('pupil', 1.29, .007, [(8.45, 71.9), (8.45, 60.0)])
    actor('pupil', 1.35, .007, [(14.2, 67.2), (14.2, 73.9)])
    actor('pupil', 1.31, .007, [(19.2, 73.0), (15.85, 72.25), (15.8, 63.9)])
    actor('pupil', 1.39, .007, [(2.25, 66.85), (2.15, 59.15)])
    actor('pupil', 1.34, .007, [(19.5, 66.25)], -38)
    actor('pupil', 1.28, .007, [(20.4, 67.05)], -140)
    actor('adult', 1.71, -.041, [(52.7, 88.94)], 14)
    actor('adult', 1.67, -.041, [(55.1, 89.0)], -22)

    # Courtyard and rear passage points stay clear of planter edges and doorways.
    actor('pupil', 1.32, -.021, [(3.2, 10.7), (3.25, 19.7), (12.5, 20.25)])
    actor('pupil', 1.39, -.021, [(18.85, 19.1), (18.85, 13.0)])
    actor('pupil', 1.26, -.021, [(8.8, 14.05)], 52)
    actor('adult', 1.71, -.021, [(9.8, 14.85)], -126)
    actor('pupil', 1.38, -.03, [(52.9, -48.25), (45.3, -47.8), (42.2, -43.8)])
    actor('pupil', 1.43, -.03, [(49.8, -44.65), (46.3, -42.2), (41.6, -42.2)])
    actor('pupil', 1.31, -.03, [(57.4, -49.1)], -26)
    actor('adult', 1.73, -.03, [(56.8, -47.9)], 151)

    # Three pupils crossing the football field between activities.
    actor('pupil', 1.35, .032, [(-75.5, -18.4), (-69.8, -26.3), (-63.6, -28.0)])
    actor('pupil', 1.39, .032, [(-84.1, -25.9), (-80.2, -19.0)])
    actor('pupil', 1.30, .032, [(-77.6, -25.2)], -8)
    return people
