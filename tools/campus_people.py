"""Place small groups and foot routes around the school day landmarks."""

import math


def build_campus_people(world):
    people = []
    site_yaw = math.atan2(world(0, 0, 1)[0], world(0, 0, 1)[2])

    def heading(degrees):
        return round(math.radians(degrees) + site_yaw, 4)

    def actor(role, height, y, path, facing=None):
        data = {'role': role, 'height': height, 'points': [world(x, y, z) for x, z in path]}
        if facing is not None:
            data['facing'] = heading(facing)
        people.append(data)
        return data

    def circuit(role, height, y, points, stops, pace=None, group=None):
        data = actor(role, height, y, points)
        data['loop'] = True
        data['stops'] = [{'point': point, 'wait': [short, long], 'facing': heading(facing)}
                         for point, short, long, facing in stops]
        if pace is not None:
            data['pace'] = pace
        if group is not None:
            data['group'] = group

    # Gate staff stay by their posts. Families use the paving behind the gate.
    actor('guard', 1.76, .007, [(4.6, 61.5)], 29)
    actor('guard', 1.72, .007, [(17.2, 61.5)], -31)
    actor('volunteer', 1.66, .007, [(3.8, 88.25)], -40)
    actor('volunteer', 1.71, .007, [(28.1, 88.45)], -145)
    # A parent and pupil approach the steps together, then move back toward the gate.
    family_path = [(6.8, 72.8), (6.8, 60.5), (8.3, 58.7), (10.65, 58.7),
                   (11.4, 61.15), (11.4, 72.8), (10.45, 74.25), (7.85, 74.25)]
    family_stops = [(0, 8, 14, 18), (2, 5.5, 9, 155)]
    circuit('adult', 1.68, .007, family_path, family_stops, pace=.98, group=23)
    circuit('pupil', 1.29, .007, [(x + 1.06, z - .18) for x, z in family_path],
            family_stops, pace=.98, group=23)
    circuit('pupil', 1.35, .007, [(13.6, 67.2), (13.6, 73.0), (14.55, 74.9), (15.2, 71.9), (14.75, 68.4)],
            [(0, 11, 17, 4), (2, 5.5, 10, 182)])
    circuit('pupil', 1.31, .007, [(19.2, 73.0), (16.6, 71.0), (16.6, 64.2), (18.15, 63.5),
                                 (18.3, 68.3), (19.35, 70.1)],
            [(0, 9, 18, 15), (3, 4.5, 8.5, -150)])
    circuit('pupil', 1.39, .007, [(2.25, 66.85), (2.15, 59.75), (3.35, 58.8), (3.25, 65.9)],
            [(0, 6, 11, 12), (2, 9, 16, 166)])
    actor('pupil', 1.34, .007, [(19.5, 66.25)], -38)
    actor('pupil', 1.28, .007, [(20.4, 67.05)], -140)
    actor('adult', 1.71, -.041, [(52.7, 88.94)], 14)
    actor('adult', 1.67, -.041, [(55.1, 89.0)], -22)

    # Courtyard and rear passage points stay clear of planter edges and doorways.
    circuit('pupil', 1.32, -.021, [(3.2, 10.7), (3.25, 19.7), (12.5, 20.25), (12.65, 17.3),
                                  (5.7, 16.8), (5.8, 11.3)],
            [(0, 6, 10, 45), (2, 10, 18, -92)])
    circuit('pupil', 1.39, -.021, [(18.85, 19.1), (17.65, 16.95), (17.7, 13.0), (20.65, 12.4),
                                  (20.6, 17.7)],
            [(0, 7, 11, -84), (2, 5.5, 10, -96)])
    actor('pupil', 1.26, -.021, [(8.8, 14.05)], 52)
    actor('adult', 1.71, -.021, [(9.8, 14.85)], -126)
    circuit('pupil', 1.38, -.03, [(52.9, -48.25), (45.3, -47.8), (42.2, -44.1), (48.5, -45.9),
                                 (52.7, -46.15)],
            [(0, 8, 13, 95), (2, 6, 10, -86)])
    circuit('pupil', 1.43, -.03, [(49.8, -44.65), (46.3, -42.2), (41.6, -42.2), (46.1, -40.95), (50.5, -42.7)],
            [(0, 4.5, 9, -152), (2, 9, 15, -105)])
    actor('pupil', 1.31, -.03, [(57.4, -49.1)], -26)
    actor('adult', 1.73, -.03, [(56.8, -47.9)], 151)

    # Three pupils crossing the football field between activities.
    circuit('pupil', 1.35, .032, [(-75.5, -18.4), (-69.8, -26.3), (-63.6, -28.0), (-63.8, -20.3),
                                 (-68.9, -16.1)],
            [(0, 12, 20, 30), (2, 6, 12, -51)])
    circuit('pupil', 1.39, .032, [(-84.1, -25.9), (-80.2, -19.0), (-85.4, -15.8), (-89.2, -21.6)],
            [(0, 6, 12, -6), (2, 10, 19, 160)])
    actor('pupil', 1.30, .032, [(-77.6, -25.2)], -8)
    return people
